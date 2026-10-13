#!/usr/bin/env node
// Live contract/QA suite for the EchoNova API (TTS, STT, Sound Cleaning — 12 endpoints).
// WARNING: hits the real API and consumes credits. Never wire into `npm test`.
//
// Usage:
//   ECHONOVA_API_KEY=... node scripts/qa-echonova-api.mjs [out.json]
// Optional:
//   ECHONOVA_API_BASE   (default https://api.echonova.ai)
//   ECHONOVA_HEAVY=1    also run the >10 min / >150 MB upload limit cases (slow, may cost credits)
// Requires ffmpeg on PATH — all audio fixtures are generated locally.

import { execFileSync, spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, basename } from 'node:path'

const BASE = (process.env.ECHONOVA_API_BASE || 'https://api.echonova.ai').replace(/\/$/, '')
const KEY = process.env.ECHONOVA_API_KEY
const HEAVY = process.env.ECHONOVA_HEAVY === '1'
const OUT = process.argv[2] || 'reports/echonova-api-qa.json'
const RUN = `QA-ECHO-${Date.now().toString(36).toUpperCase()}`
const FIX = join(tmpdir(), 'echonova-fixtures')
const POLL_TIMEOUT_MS = 180000

if (!KEY) {
  console.error('Set ECHONOVA_API_KEY')
  process.exit(2)
}

const results = []
const jobs = { tts: [], stt: [], clean: [] }
const errorBodies = []

const brief = (v, max = 260) => {
  const s = typeof v === 'string' ? v : JSON.stringify(v)
  return s && s.length > max ? `${s.slice(0, max)}…` : s
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function api(method, path, { body, form, rawBody, contentType, auth = true, bearer, rawAuth, timeout = 120000 } = {}) {
  const headers = { Accept: 'application/json' }
  if (rawAuth !== undefined) headers.Authorization = rawAuth
  else if (bearer !== undefined) headers.Authorization = `Bearer ${bearer}`
  else if (auth) headers.Authorization = `Bearer ${KEY}`
  let payload
  if (form) payload = form
  else if (rawBody !== undefined) { payload = rawBody; headers['Content-Type'] = contentType || 'application/json' }
  else if (body !== undefined) { payload = JSON.stringify(body); headers['Content-Type'] = 'application/json' }
  const started = Date.now()
  let res
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: payload, signal: AbortSignal.timeout(timeout) })
  } catch (error) {
    return { status: 0, json: null, text: String(error?.cause || error), ms: Date.now() - started }
  }
  const text = await res.text()
  let json = null
  try { json = JSON.parse(text) } catch { /* non-JSON body */ }
  if (res.status >= 400) errorBodies.push({ path, status: res.status, json: json !== null && typeof json === 'object', text: text.slice(0, 120) })
  return { status: res.status, json, text, ms: Date.now() - started, headers: Object.fromEntries(res.headers) }
}

// verdict: GREEN (as expected), RED (defect), INFO (behaviour to confirm with the API owner)
function record(id, group, title, expected, verdict, actual, res) {
  const row = { id, group, title, expected, verdict, actual, http: res?.status ?? null, ms: res?.ms ?? null }
  results.push(row)
  const mark = verdict === 'GREEN' ? '🟢' : verdict === 'RED' ? '🔴' : '🔵'
  console.log(`${mark} ${id} ${title} → ${actual}`)
  return row
}

const leaks = (res) => /traceback|stack|exception|at \w+ \(|\.py", line|node_modules/i.test(res?.text || '')
const errText = (res) => brief(res.json?.error || res.json?.message || res.json?.detail || res.json?.errors || res.text, 220)
const credits = (res) => Number(res.json?.creditsConsumed ?? res.json?.data?.creditsConsumed ?? 0)
const data = (res) => res.json?.data ?? res.json

/** Expect a specific HTTP status (or one of). Also flags stack-trace leaks and credits charged on errors. */
function expectStatus(id, group, title, res, want, extra = '') {
  const wants = Array.isArray(want) ? want : [want]
  const ok = wants.includes(res.status)
  const leak = leaks(res) ? ' [LEAKS stack trace]' : ''
  const charged = res.status >= 400 && credits(res) > 0 ? ` [CHARGED ${credits(res)} credits on error]` : ''
  record(id, group, title, `HTTP ${wants.join('/')}${extra ? ` — ${extra}` : ''}`,
    ok && !leak && !charged ? 'GREEN' : 'RED', `HTTP ${res.status}${leak}${charged} ${errText(res)}`, res)
  return ok
}

/** Expect a 4xx validation rejection (400 or 422). */
const expectReject = (id, group, title, res, extra) => expectStatus(id, group, title, res, [400, 422], extra)

/** Check that every key is present on obj; returns list of missing keys. */
const missing = (obj, keys) => keys.filter((k) => obj == null || obj[k] === undefined)

// ───────────────────────── Fixtures ─────────────────────────
function ff(args) { execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'pipe' }) }

function buildFixtures() {
  mkdirSync(FIX, { recursive: true })
  const f = (n) => join(FIX, n)
  // Noisy tone: 440 Hz + pink noise — useful for sound-cleaning, and a valid file for STT format checks.
  const src = ['-f', 'lavfi', '-i', 'sine=frequency=440:duration=6', '-f', 'lavfi', '-i', 'anoisesrc=color=pink:amplitude=0.08:duration=6',
    '-filter_complex', 'amix=inputs=2:duration=shortest']
  if (!existsSync(f('tone.wav'))) ff([...src, '-ar', '16000', '-ac', '1', f('tone.wav')])
  for (const [ext, codec] of [['mp3', ['-c:a', 'libmp3lame', '-b:a', '64k']], ['flac', ['-c:a', 'flac']], ['ogg', ['-c:a', 'libvorbis']], ['m4a', ['-c:a', 'aac', '-b:a', '64k']]]) {
    if (!existsSync(f(`tone.${ext}`))) ff(['-i', f('tone.wav'), ...codec, f(`tone.${ext}`)])
  }
  if (!existsSync(f('silence.wav'))) ff(['-f', 'lavfi', '-i', 'anullsrc=r=16000:cl=mono', '-t', '3', f('silence.wav')])
  if (!existsSync(f('tiny.wav'))) ff(['-f', 'lavfi', '-i', 'sine=frequency=440:duration=0.1', f('tiny.wav')])
  if (!existsSync(f('video.mp4'))) ff(['-f', 'lavfi', '-i', 'testsrc=duration=2:size=160x120:rate=10', '-f', 'lavfi', '-i', 'sine=duration=2', '-shortest', '-c:v', 'libx264', '-c:a', 'aac', f('video.mp4')])
  if (!existsSync(f('unsupported.aac'))) ff(['-i', f('tone.wav'), '-c:a', 'aac', '-f', 'adts', f('unsupported.aac')])
  writeFileSync(f('empty.mp3'), Buffer.alloc(0))
  writeFileSync(f('corrupt.mp3'), Buffer.from(Array.from({ length: 4096 }, (_, i) => (i * 7919) % 256)))
  writeFileSync(f('notes.txt'), 'this is not audio\n'.repeat(50))
  writeFileSync(f('fake-audio.mp3'), '%PDF-1.4\n% text renamed to .mp3\n'.repeat(40))
  if (HEAVY) {
    if (!existsSync(f('long-11min.mp3'))) ff(['-f', 'lavfi', '-i', 'sine=frequency=300:duration=660', '-ac', '1', '-b:a', '16k', '-c:a', 'libmp3lame', f('long-11min.mp3')])
    // ~160 MB but short duration: high sample-rate float WAV, 4 channels.
    if (!existsSync(f('big-160mb.wav'))) ff(['-f', 'lavfi', '-i', 'sine=frequency=500:duration=210:sample_rate=48000', '-ac', '4', '-c:a', 'pcm_f32le', f('big-160mb.wav')])
  }
  return f
}

const MIME = { wav: 'audio/wav', mp3: 'audio/mpeg', flac: 'audio/flac', ogg: 'audio/ogg', m4a: 'audio/mp4', txt: 'text/plain', mp4: 'video/mp4', aac: 'audio/aac' }
function fileForm(path, fields = {}, { field = 'file', mime } = {}) {
  const form = new FormData()
  if (path) {
    const ext = path.split('.').pop()
    form.append(field, new Blob([readFileSync(path)], { type: mime || MIME[ext] || 'application/octet-stream' }), basename(path))
  }
  for (const [k, v] of Object.entries(fields)) form.append(k, String(v))
  return form
}

async function downloadOk(url) {
  if (!url) return { ok: false, why: 'no url' }
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(60000) })
    const buf = Buffer.from(await r.arrayBuffer())
    return { ok: r.ok && buf.length > 44, status: r.status, size: buf.length, buf, type: r.headers.get('content-type') }
  } catch (e) { return { ok: false, why: String(e) } }
}

async function pollJob(path, doneKey = 'status') {
  const started = Date.now()
  let last
  while (Date.now() - started < POLL_TIMEOUT_MS) {
    last = await api('GET', path)
    const st = String(data(last)?.[doneKey] || '').toLowerCase()
    if (last.status !== 200 || ['completed', 'failed', 'error', 'succeeded', 'done'].includes(st)) break
    await sleep(3000)
  }
  last.waitedMs = Date.now() - started
  return last
}

// ───────────────────────── Shared groups ─────────────────────────
async function authCases(prefix, group, method, path, mk = () => ({})) {
  expectStatus(`${prefix}-A1`, group, 'No Authorization header', await api(method, path, { auth: false, ...mk() }), 401)
  expectStatus(`${prefix}-A2`, group, 'Invalid API key', await api(method, path, { bearer: 'ek_invalid_key_000000000000', ...mk() }), [401, 403])
  expectStatus(`${prefix}-A3`, group, 'Key without "Bearer " prefix', await api(method, path, { rawAuth: KEY, ...mk() }), [401, 403])
  expectStatus(`${prefix}-A4`, group, 'Empty bearer token', await api(method, path, { rawAuth: 'Bearer ', ...mk() }), [401, 403])
}

async function listCases(prefix, group, path, idKey = 'jobId') {
  const res = await api('GET', path)
  const d = data(res)
  const items = d?.items
  const okShape = res.status === 200 && Array.isArray(items) && typeof d?.total === 'number'
  record(`${prefix}-L1`, group, `GET ${path} default`, 'HTTP 200, items[] + total:number', okShape ? 'GREEN' : 'RED',
    `HTTP ${res.status}, items=${Array.isArray(items) ? items.length : typeof items}, total=${d?.total}`, res)
  if (Array.isArray(items) && items.length > 20) record(`${prefix}-L2`, group, 'Default limit = 20', '≤ 20 items', 'RED', `${items.length} items`, res)
  else record(`${prefix}-L2`, group, 'Default limit = 20', '≤ 20 items', okShape ? 'GREEN' : 'INFO', `${items?.length ?? 'n/a'} items`, res)

  const one = await api('GET', `${path}?limit=1`)
  const n1 = data(one)?.items?.length
  record(`${prefix}-L3`, group, 'limit=1', 'exactly 1 item (when total ≥ 1)', one.status === 200 && (n1 === 1 || (d?.total === 0 && n1 === 0)) ? 'GREEN' : 'RED', `HTTP ${one.status}, items=${n1}`, one)

  if ((d?.total ?? 0) >= 2) {
    const p0 = data(await api('GET', `${path}?limit=1&offset=0`))?.items?.[0]
    const p1r = await api('GET', `${path}?limit=1&offset=1`)
    const p1 = data(p1r)?.items?.[0]
    const id0 = p0?.[idKey] ?? p0?.id, id1 = p1?.[idKey] ?? p1?.id
    record(`${prefix}-L4`, group, 'offset paginates (offset 0 vs 1 differ)', 'different items', id0 && id1 && id0 !== id1 ? 'GREEN' : 'RED', `offset0=${id0}, offset1=${id1}`, p1r)
  } else record(`${prefix}-L4`, group, 'offset paginates', 'needs total ≥ 2', 'INFO', `total=${d?.total}`, res)

  const beyond = await api('GET', `${path}?offset=100000`)
  record(`${prefix}-L5`, group, 'offset beyond total', 'HTTP 200, empty items', beyond.status === 200 && data(beyond)?.items?.length === 0 ? 'GREEN' : 'RED', `HTTP ${beyond.status}, items=${data(beyond)?.items?.length}`, beyond)
  expectReject(`${prefix}-L6`, group, 'offset=-1', await api('GET', `${path}?offset=-1`))
  expectReject(`${prefix}-L7`, group, 'limit=0', await api('GET', `${path}?limit=0`))
  expectReject(`${prefix}-L8`, group, 'limit=-5', await api('GET', `${path}?limit=-5`))
  expectReject(`${prefix}-L9`, group, 'limit=abc (non-numeric)', await api('GET', `${path}?limit=abc`))
  const huge = await api('GET', `${path}?limit=100000`)
  const nh = data(huge)?.items?.length ?? 0
  record(`${prefix}-L10`, group, 'limit=100000 (no max cap?)', 'rejected (400/422) or capped (≤ 100)',
    [400, 422].includes(huge.status) || (huge.status === 200 && nh <= 100) ? 'GREEN' : huge.status === 200 ? 'INFO' : 'RED', `HTTP ${huge.status}, items=${nh}`, huge)
  await authCases(`${prefix}-L`, group, 'GET', path)
  return items || []
}

async function jobByIdCases(prefix, group, base, knownId) {
  if (knownId) {
    const r = await api('GET', `${base}/${knownId}`)
    record(`${prefix}-J1`, group, 'GET job by valid id', 'HTTP 200, same id', r.status === 200 && [data(r)?.jobId, data(r)?.id].includes(knownId) ? 'GREEN' : 'RED',
      `HTTP ${r.status}, id=${data(r)?.jobId ?? data(r)?.id}, status=${data(r)?.status}`, r)
  } else record(`${prefix}-J1`, group, 'GET job by valid id', 'needs a created job', 'INFO', 'no job id available')
  expectStatus(`${prefix}-J2`, group, 'Non-existent job id (UUID)', await api('GET', `${base}/00000000-0000-0000-0000-000000000000`), 404)
  expectStatus(`${prefix}-J3`, group, 'Malformed job id', await api('GET', `${base}/not-a-real-id`), [400, 404, 422])
  expectStatus(`${prefix}-J4`, group, 'SQL/NoSQL-injection-like id', await api('GET', `${base}/${encodeURIComponent("1' OR '1'='1")}`), [400, 404, 422])
  expectStatus(`${prefix}-J5`, group, 'Path traversal id', await api('GET', `${base}/..%2F..%2Fetc%2Fpasswd`), [400, 404, 422])
  if (knownId) await authCases(`${prefix}-J`, group, 'GET', `${base}/${knownId}`)
}

// ───────────────────────── 1. TTS ─────────────────────────
async function tts(f) {
  const G = 'TTS'
  const vr = await api('GET', '/v1/text-to-speech/voices')
  const voices = data(vr)?.items || (Array.isArray(data(vr)) ? data(vr) : [])
  record('TTS-V1', G, 'GET /voices', 'HTTP 200, non-empty items[]', vr.status === 200 && voices.length > 0 ? 'GREEN' : 'RED', `HTTP ${vr.status}, ${voices.length} voices`, vr)
  const badShape = voices.filter((v) => missing(v, ['id', 'name', 'displayName', 'language', 'gender']).length)
  record('TTS-V2', G, 'Each voice has id, name, displayName, language, gender', 'all fields present', voices.length && !badShape.length ? 'GREEN' : 'RED',
    badShape.length ? `${badShape.length} voices missing fields, e.g. ${brief(badShape[0])}` : `${voices.length} ok`, vr)
  const ids = voices.map((v) => v.id)
  record('TTS-V3', G, 'Voice ids are unique', 'no duplicates', new Set(ids).size === ids.length ? 'GREEN' : 'RED', `${ids.length} ids, ${new Set(ids).size} unique`, vr)
  record('TTS-V4', G, 'Voice catalogue (for the record)', 'languages / genders', 'INFO',
    `languages=${[...new Set(voices.map((v) => v.language))].join(',')} genders=${[...new Set(voices.map((v) => v.gender))].join(',')}`, vr)
  await authCases('TTS-V', G, 'GET', '/v1/text-to-speech/voices')

  const isMsa = (v) => /msa|fusha|fus7a|فصحى|standard/i.test(`${v.id} ${v.name} ${v.displayName} ${v.language}`)
  const arVoice = voices.find(isMsa) || voices.find((v) => /^ar/i.test(v.language)) || voices[0]
  const enVoice = voices.find((v) => /^en/i.test(v.language)) || voices[0]
  const dialect = voices.find((v) => /^ar/i.test(v.language) && !isMsa(v))
  if (!arVoice) { record('TTS-X0', G, 'Voices needed for TTS cases', 'at least 1 voice', 'RED', 'no voices — TTS generation cases skipped'); return {} }
  const VID = arVoice.id
  const AR = 'مرحبا بكم في اختبار جودة منصة إيكو نوفا.'
  const S = '/v1/text-to-speech/sync'
  let speechWav

  // ── Positive sync
  const s1 = await api('POST', S, { body: { text: AR, voiceId: VID } })
  const d1 = data(s1)
  const miss1 = missing(d1, ['jobId', 'status', 'audioUrl', 'durationSeconds', 'creditsConsumed'])
  record('TTS-S1', G, 'Sync: Arabic text, defaults', 'HTTP 200, status=completed, jobId/audioUrl/durationSeconds/creditsConsumed',
    s1.status === 200 && d1?.status === 'completed' && !miss1.length ? 'GREEN' : 'RED',
    `HTTP ${s1.status}, status=${d1?.status}, missing=[${miss1}], duration=${d1?.durationSeconds}, credits=${d1?.creditsConsumed}, ${s1.ms} ms`, s1)
  if (d1?.jobId) jobs.tts.push(d1.jobId)
  const dl = await downloadOk(d1?.audioUrl)
  const isWav = dl.buf && dl.buf.slice(0, 4).toString() === 'RIFF' && dl.buf.slice(8, 12).toString() === 'WAVE'
  record('TTS-S2', G, 'audioUrl downloads a valid WAV', 'HTTP 200, RIFF/WAVE header', dl.ok && isWav ? 'GREEN' : 'RED', `download=${dl.status ?? dl.why}, size=${dl.size}, type=${dl.type}, wav=${isWav}`)
  if (dl.ok) { speechWav = f('tts-speech.wav'); writeFileSync(speechWav, dl.buf) }
  if (d1?.durationSeconds != null) record('TTS-S3', G, 'durationSeconds is sane', '0 < d < 30 s for a short sentence', d1.durationSeconds > 0 && d1.durationSeconds < 30 ? 'GREEN' : 'RED', `${d1.durationSeconds}`)
  const unauthDl = d1?.audioUrl ? await fetch(d1.audioUrl.split('?')[0], { signal: AbortSignal.timeout(30000) }).then((r) => r.status).catch(() => 0) : null
  if (unauthDl != null) record('TTS-S4', G, 'audioUrl without signature is not public', 'HTTP 401/403/404', [401, 403, 404, 400].includes(unauthDl) ? 'GREEN' : 'INFO', `unsigned URL → HTTP ${unauthDl}`)

  const s5 = await api('POST', S, { body: { text: 'Welcome to the EchoNova quality test.', voiceId: enVoice.id } })
  expectStatus('TTS-S5', G, `Sync: English text (${enVoice.id})`, s5, 200)
  const variants = [
    ['TTS-S6', 'speed=0.5 (min)', { speed: 0.5 }], ['TTS-S7', 'speed=2.0 (max)', { speed: 2.0 }],
    ['TTS-S8', 'cfg=1 (min)', { cfg: 1 }], ['TTS-S9', 'cfg=5 (max)', { cfg: 5 }],
    ['TTS-S10', 'numSteps=16', { numSteps: 16 }], ['TTS-S11', 'numSteps=64', { numSteps: 64 }], ['TTS-S12', 'numSteps=128', { numSteps: 128 }],
    ['TTS-S13', 'tashkeel=true with MSA voice', { tashkeel: true }], ['TTS-S14', 'text exactly 500 chars', { text: 'ا'.repeat(499) + '.' }],
    ['TTS-S15', 'text 1 char', { text: 'أ' }], ['TTS-S16', 'mixed Arabic/English + digits', { text: 'السعر 250 جنيه for the premium plan.' }],
    ['TTS-S17', 'emoji / symbols in text', { text: 'مرحبا 👋 & <test> "quotes"' }],
  ]
  const durs = {}
  for (const [id, title, extra] of variants) {
    const r = await api('POST', S, { body: { text: AR, voiceId: VID, ...extra } })
    durs[id] = data(r)?.durationSeconds
    expectStatus(id, G, `Sync: ${title}`, r, 200, `duration=${data(r)?.durationSeconds}`)
  }
  if (durs['TTS-S6'] && durs['TTS-S7']) record('TTS-S18', G, 'speed actually changes duration', 'duration(0.5) > duration(2.0)', durs['TTS-S6'] > durs['TTS-S7'] ? 'GREEN' : 'RED', `0.5→${durs['TTS-S6']}s, 2.0→${durs['TTS-S7']}s`)
  for (const voice of voices.filter((v) => v.id !== VID && v.id !== enVoice.id)) {
    const r = await api('POST', S, { body: { text: /^en/i.test(voice.language) ? 'Quick voice check.' : 'تجربة سريعة للصوت.', voiceId: voice.id } })
    expectStatus(`TTS-SV-${voice.id}`, G, `Sync: voice ${voice.displayName || voice.name}`, r, 200)
  }

  // ── Negative sync
  const neg = [
    ['TTS-N1', 'missing text', { voiceId: VID }], ['TTS-N2', 'empty text ""', { text: '', voiceId: VID }],
    ['TTS-N3', 'whitespace-only text', { text: '    ', voiceId: VID }], ['TTS-N4', 'text 501 chars', { text: 'ا'.repeat(501), voiceId: VID }],
    ['TTS-N5', 'missing voiceId', { text: AR }], ['TTS-N6', 'unknown voiceId', { text: AR, voiceId: 'voice_does_not_exist_123' }],
    ['TTS-N7', 'speed=0.4 (<min)', { text: AR, voiceId: VID, speed: 0.4 }], ['TTS-N8', 'speed=2.1 (>max)', { text: AR, voiceId: VID, speed: 2.1 }],
    ['TTS-N9', 'speed=0', { text: AR, voiceId: VID, speed: 0 }], ['TTS-N10', 'speed="fast" (string)', { text: AR, voiceId: VID, speed: 'fast' }],
    ['TTS-N11', 'cfg=0', { text: AR, voiceId: VID, cfg: 0 }], ['TTS-N12', 'cfg=6', { text: AR, voiceId: VID, cfg: 6 }],
    ['TTS-N13', 'numSteps=20 (not in 16/32/64/128)', { text: AR, voiceId: VID, numSteps: 20 }], ['TTS-N14', 'numSteps=256', { text: AR, voiceId: VID, numSteps: 256 }],
    ['TTS-N15', 'numSteps=32.5', { text: AR, voiceId: VID, numSteps: 32.5 }], ['TTS-N16', 'tashkeel="yes" (string)', { text: AR, voiceId: VID, tashkeel: 'yes' }],
    ['TTS-N17', 'text as number', { text: 12345, voiceId: VID }], ['TTS-N18', 'text as array', { text: ['a'], voiceId: VID }],
    ['TTS-N19', 'voiceId as number', { text: AR, voiceId: 1 }], ['TTS-N20', 'null text', { text: null, voiceId: VID }],
  ]
  for (const [id, title, body] of neg) expectReject(id, G, `Sync: ${title}`, await api('POST', S, { body }))
  if (dialect) {
    const r = await api('POST', S, { body: { text: AR, voiceId: dialect.id, tashkeel: true } })
    record('TTS-N21', G, `Sync: tashkeel=true with dialect voice (${dialect.id})`, 'rejected (400/422) or ignored (200) — docs say MSA only', [400, 422].includes(r.status) ? 'GREEN' : r.status === 200 ? 'INFO' : 'RED', `HTTP ${r.status} ${errText(r)}`, r)
  }
  expectReject('TTS-N22', G, 'Sync: malformed JSON', await api('POST', S, { rawBody: '{"text": "مرحبا", "voiceId":' }))
  expectStatus('TTS-N23', G, 'Sync: wrong Content-Type (text/plain)', await api('POST', S, { rawBody: JSON.stringify({ text: AR, voiceId: VID }), contentType: 'text/plain' }), [400, 415, 422])
  expectReject('TTS-N24', G, 'Sync: empty body {}', await api('POST', S, { body: {} }))
  const unk = await api('POST', S, { body: { text: AR, voiceId: VID, foo: 'bar' } })
  record('TTS-N25', G, 'Sync: unknown extra field', 'ignored (200) or rejected (400/422)', [200, 400, 422].includes(unk.status) ? 'GREEN' : 'RED', `HTTP ${unk.status}`, unk)
  expectStatus('TTS-N26', G, 'GET on POST-only /sync', await api('GET', S), [404, 405])
  await authCases('TTS-S', G, 'POST', S, () => ({ body: { text: AR, voiceId: VID } }))

  // ── Async
  const A = '/v1/text-to-speech'
  const a1 = await api('POST', A, { body: { text: AR, voiceId: VID } })
  const ad = data(a1)
  record('TTS-AS1', G, 'Async: create job', 'HTTP 200/201/202, jobId + status=processing', [200, 201, 202].includes(a1.status) && ad?.jobId && /processing|queued|pending/i.test(ad?.status) ? 'GREEN' : 'RED',
    `HTTP ${a1.status}, jobId=${ad?.jobId}, status=${ad?.status}, ${a1.ms} ms`, a1)
  record('TTS-AS2', G, 'Async returns quickly', '< 3000 ms', a1.ms < 3000 ? 'GREEN' : 'INFO', `${a1.ms} ms`, a1)
  if (ad?.jobId) {
    jobs.tts.push(ad.jobId)
    const done = await pollJob(`/v1/text-to-speech/jobs/${ad.jobId}`)
    const dd = data(done)
    record('TTS-AS3', G, 'Async job reaches completed with audioUrl', 'status=completed, audioUrl present', dd?.status === 'completed' && dd?.audioUrl ? 'GREEN' : 'RED',
      `status=${dd?.status}, audioUrl=${Boolean(dd?.audioUrl)}, waited ${done.waitedMs} ms`, done)
    const adl = await downloadOk(dd?.audioUrl)
    record('TTS-AS4', G, 'Async audioUrl downloads', 'HTTP 200', adl.ok ? 'GREEN' : 'RED', `download=${adl.status ?? adl.why}, size=${adl.size}`)
  }
  const a5 = await api('POST', A, { body: { text: AR, voiceId: VID, speed: 1.5, cfg: 3, numSteps: 64 } })
  expectStatus('TTS-AS5', G, 'Async: all optional params', a5, [200, 201, 202])
  if (data(a5)?.jobId) jobs.tts.push(data(a5).jobId)
  for (const [id, title, body] of [['TTS-AN1', 'missing text', { voiceId: VID }], ['TTS-AN2', 'text 501 chars', { text: 'a'.repeat(501), voiceId: VID }],
    ['TTS-AN3', 'unknown voiceId', { text: AR, voiceId: 'nope_123' }], ['TTS-AN4', 'numSteps=20', { text: AR, voiceId: VID, numSteps: 20 }],
    ['TTS-AN5', 'speed=3', { text: AR, voiceId: VID, speed: 3 }], ['TTS-AN6', 'cfg=10', { text: AR, voiceId: VID, cfg: 10 }]]) {
    const r = await api('POST', A, { body })
    expectReject(id, G, `Async: ${title} (must fail at create, not later)`, r)
  }
  expectReject('TTS-AN7', G, 'Async: malformed JSON', await api('POST', A, { rawBody: '{bad json' }))
  await authCases('TTS-A', G, 'POST', A, () => ({ body: { text: AR, voiceId: VID } }))

  // ── Jobs
  const list = await listCases('TTS', `${G} jobs`, '/v1/text-to-speech/jobs')
  if (jobs.tts.length) {
    const seen = list.some((j) => jobs.tts.includes(j.jobId ?? j.id))
    record('TTS-L11', `${G} jobs`, 'Jobs created in this run appear in the list', 'at least one present in first page', seen ? 'GREEN' : 'INFO', `run jobs=${jobs.tts.length}, found=${seen}`)
  }
  await jobByIdCases('TTS', `${G} jobs`, '/v1/text-to-speech/jobs', jobs.tts[0])
  if (jobs.tts[0]) {
    const j = data(await api('GET', `/v1/text-to-speech/jobs/${jobs.tts[0]}`))
    const jdl = await downloadOk(j?.audioUrl)
    record('TTS-J6', `${G} jobs`, 'Job detail returns a fresh, working audioUrl', 'download 200', jdl.ok ? 'GREEN' : 'RED', `download=${jdl.status ?? jdl.why}`)
  }
  return { speechWav }
}

// ───────────────────────── 2. STT ─────────────────────────
async function stt(f, speechWav) {
  const G = 'STT'
  const S = '/v1/speech-to-text/sync'
  const speech = speechWav || f('tone.wav')
  if (!speechWav) record('STT-X0', G, 'Real speech fixture', 'TTS output reused as STT input', 'INFO', 'TTS download failed — using synthetic tone; transcription accuracy cannot be judged')

  const r1 = await api('POST', S, { form: fileForm(speech, { language: 'ar' }) })
  const d1 = data(r1)
  const miss = missing(d1, ['jobId', 'status', 'transcription', 'durationSeconds', 'creditsConsumed'])
  record('STT-S1', G, 'Sync: WAV, language=ar', 'HTTP 200, status=completed, jobId/transcription/durationSeconds/creditsConsumed',
    r1.status === 200 && d1?.status === 'completed' && !miss.length ? 'GREEN' : 'RED',
    `HTTP ${r1.status}, status=${d1?.status}, missing=[${miss}], text="${brief(d1?.transcription, 120)}", ${r1.ms} ms`, r1)
  if (d1?.jobId) jobs.stt.push(d1.jobId)
  if (speechWav && typeof d1?.transcription === 'string') {
    const hit = ['مرحبا', 'اختبار', 'منصة'].filter((w) => d1.transcription.includes(w))
    record('STT-S2', G, 'Transcription accuracy (round-trip of TTS sentence)', 'contains key words مرحبا/اختبار/منصة', hit.length >= 2 ? 'GREEN' : 'RED', `matched ${hit.length}/3: [${hit}]`)
  }
  for (const [id, lang] of [['STT-S3', 'auto'], ['STT-S4', undefined]]) {
    expectStatus(id, G, `Sync: language=${lang ?? '(omitted → auto)'}`, await api('POST', S, { form: fileForm(speech, lang ? { language: lang } : {}) }), 200)
  }
  expectStatus('STT-S5', G, 'Sync: language=en on English-ish audio', await api('POST', S, { form: fileForm(f('tone.wav'), { language: 'en' }) }), 200)
  for (const ext of ['mp3', 'flac', 'ogg', 'm4a']) {
    const r = await api('POST', S, { form: fileForm(f(`tone.${ext}`), { language: 'auto' }) })
    expectStatus(`STT-F-${ext}`, G, `Sync: format .${ext}`, r, 200, `duration=${data(r)?.durationSeconds}`)
  }
  const sil = await api('POST', S, { form: fileForm(f('silence.wav'), { language: 'ar' }) })
  record('STT-S6', G, 'Sync: pure silence', 'HTTP 200 with empty/blank transcription (no hallucinated text)', sil.status === 200 && !String(data(sil)?.transcription ?? '').trim() ? 'GREEN' : sil.status === 200 ? 'INFO' : 'RED',
    `HTTP ${sil.status}, text="${brief(data(sil)?.transcription, 80)}"`, sil)
  const tiny = await api('POST', S, { form: fileForm(f('tiny.wav')) })
  record('STT-S7', G, 'Sync: 0.1 s clip', 'HTTP 200 or clear 4xx', [200, 400, 422].includes(tiny.status) ? 'GREEN' : 'RED', `HTTP ${tiny.status} ${errText(tiny)}`, tiny)

  expectReject('STT-N1', G, 'Sync: no file', await api('POST', S, { form: fileForm(null, { language: 'ar' }) }))
  expectReject('STT-N2', G, 'Sync: empty 0-byte file', await api('POST', S, { form: fileForm(f('empty.mp3')) }))
  expectStatus('STT-N3', G, 'Sync: corrupt bytes as .mp3', await api('POST', S, { form: fileForm(f('corrupt.mp3')) }), [400, 415, 422])
  expectStatus('STT-N4', G, 'Sync: .txt file', await api('POST', S, { form: fileForm(f('notes.txt')) }), [400, 415, 422])
  expectStatus('STT-N5', G, 'Sync: text disguised as .mp3', await api('POST', S, { form: fileForm(f('fake-audio.mp3')) }), [400, 415, 422])
  const aac = await api('POST', S, { form: fileForm(f('unsupported.aac')) })
  record('STT-N6', G, 'Sync: .aac (not in documented list)', 'rejected 400/415/422 (or 200 = undocumented support)', [400, 415, 422].includes(aac.status) ? 'GREEN' : aac.status === 200 ? 'INFO' : 'RED', `HTTP ${aac.status} ${errText(aac)}`, aac)
  const mp4 = await api('POST', S, { form: fileForm(f('video.mp4')) })
  record('STT-N7', G, 'Sync: .mp4 video', 'rejected 400/415/422 (or 200 = undocumented support)', [400, 415, 422].includes(mp4.status) ? 'GREEN' : mp4.status === 200 ? 'INFO' : 'RED', `HTTP ${mp4.status} ${errText(mp4)}`, mp4)
  expectReject('STT-N8', G, 'Sync: language=fr (unsupported)', await api('POST', S, { form: fileForm(speech, { language: 'fr' }) }))
  expectReject('STT-N9', G, 'Sync: language="" ', await api('POST', S, { form: fileForm(speech, { language: '' }) }))
  expectReject('STT-N10', G, 'Sync: language=AR (case)', await api('POST', S, { form: fileForm(speech, { language: 'AR' }) }))
  expectReject('STT-N11', G, 'Sync: file sent under wrong field name "audio"', await api('POST', S, { form: fileForm(speech, {}, { field: 'audio' }) }))
  expectStatus('STT-N12', G, 'Sync: JSON body instead of multipart', await api('POST', S, { body: { file: 'abc', language: 'ar' } }), [400, 415, 422])
  if (HEAVY) {
    expectStatus('STT-N13', G, 'Sync: 11-minute file (> 10 min limit)', await api('POST', S, { form: fileForm(f('long-11min.mp3')), timeout: 600000 }), [400, 413, 422])
    expectStatus('STT-N14', G, `Sync: ${Math.round(statSync(f('big-160mb.wav')).size / 1e6)} MB file (> 150 MB limit)`, await api('POST', S, { form: fileForm(f('big-160mb.wav')), timeout: 600000 }), [400, 413, 422])
  } else record('STT-N13', G, '> 10 min / > 150 MB limits', 'run with ECHONOVA_HEAVY=1', 'INFO', 'skipped (heavy)')
  await authCases('STT-S', G, 'POST', S, () => ({ form: fileForm(f('tone.wav')) }))

  const A = '/v1/speech-to-text'
  const a1 = await api('POST', A, { form: fileForm(speech, { language: 'ar' }) })
  const ad = data(a1)
  record('STT-AS1', G, 'Async: create job', 'HTTP 200/201/202, jobId + status=processing', [200, 201, 202].includes(a1.status) && ad?.jobId && /processing|queued|pending/i.test(ad?.status) ? 'GREEN' : 'RED',
    `HTTP ${a1.status}, jobId=${ad?.jobId}, status=${ad?.status}, ${a1.ms} ms`, a1)
  if (ad?.jobId) {
    jobs.stt.push(ad.jobId)
    const done = await pollJob(`/v1/speech-to-text/jobs/${ad.jobId}`)
    const dd = data(done)
    record('STT-AS2', G, 'Async job completes with transcription', 'status=completed, transcription:string', dd?.status === 'completed' && typeof dd?.transcription === 'string' ? 'GREEN' : 'RED',
      `status=${dd?.status}, text="${brief(dd?.transcription, 100)}", waited ${done.waitedMs} ms`, done)
    if (typeof d1?.transcription === 'string' && typeof dd?.transcription === 'string') {
      record('STT-AS3', G, 'Async and sync give same transcription for same file', 'identical text', d1.transcription.trim() === dd.transcription.trim() ? 'GREEN' : 'INFO', `sync="${brief(d1.transcription, 60)}" async="${brief(dd.transcription, 60)}"`)
    }
  }
  for (const ext of ['mp3', 'm4a']) expectStatus(`STT-AF-${ext}`, G, `Async: .${ext}`, await api('POST', A, { form: fileForm(f(`tone.${ext}`), { language: 'auto' }) }), [200, 201, 202])
  expectReject('STT-AN1', G, 'Async: no file', await api('POST', A, { form: fileForm(null, { language: 'ar' }) }))
  expectStatus('STT-AN2', G, 'Async: .txt file (must fail at create)', await api('POST', A, { form: fileForm(f('notes.txt')) }), [400, 415, 422])
  expectReject('STT-AN3', G, 'Async: language=de', await api('POST', A, { form: fileForm(speech, { language: 'de' }) }))
  const ac = await api('POST', A, { form: fileForm(f('corrupt.mp3')) })
  if ([200, 201, 202].includes(ac.status) && data(ac)?.jobId) {
    const done = await pollJob(`/v1/speech-to-text/jobs/${data(ac).jobId}`)
    record('STT-AN4', G, 'Async: corrupt file', 'rejected at create, or job ends status=failed with error message', /fail|error/i.test(data(done)?.status) ? 'GREEN' : 'RED', `create=HTTP ${ac.status}, final status=${data(done)?.status}, credits=${data(done)?.creditsConsumed}`, done)
  } else expectStatus('STT-AN4', G, 'Async: corrupt file', ac, [400, 415, 422])
  await authCases('STT-A', G, 'POST', A, () => ({ form: fileForm(f('tone.wav')) }))

  await listCases('STT', `${G} jobs`, '/v1/speech-to-text/jobs')
  await jobByIdCases('STT', `${G} jobs`, '/v1/speech-to-text/jobs', jobs.stt[0])
  if (jobs.tts[0]) expectStatus('STT-J6', `${G} jobs`, 'TTS jobId on STT jobs endpoint (cross-service)', await api('GET', `/v1/speech-to-text/jobs/${jobs.tts[0]}`), 404)
}

// ───────────────────────── 3. Sound cleaning ─────────────────────────
async function cleaning(f) {
  const G = 'Cleaning'
  const P = '/v1/sound-cleaning'
  const finish = async (r) => {
    const d = data(r)
    const id = d?.id ?? d?.jobId
    if (id && !/completed/i.test(d?.status || '') && [200, 201, 202].includes(r.status)) return pollJob(`/v1/sound-cleaning/jobs/${id}`)
    return r
  }
  const r1 = await api('POST', P, { form: fileForm(f('tone.wav')), timeout: 300000 })
  const id1 = data(r1)?.id ?? data(r1)?.jobId
  if (id1) jobs.clean.push(id1)
  const c1 = await finish(r1)
  const d1 = data(c1)
  const miss = missing(d1, ['status', 'outputUrl', 'metrics', 'durationSeconds'])
  record('CLN-P1', G, 'Clean WAV with defaults', 'HTTP 200/201/202 → completed with id/outputUrl/metrics/durationSeconds',
    [200, 201, 202].includes(r1.status) && id1 && /completed/i.test(d1?.status) && !miss.length ? 'GREEN' : 'RED',
    `HTTP ${r1.status}, id=${id1}, status=${d1?.status}, missing=[${miss}], metrics=${brief(d1?.metrics, 160)}`, c1)
  const out = await downloadOk(d1?.outputUrl)
  record('CLN-P2', G, 'outputUrl downloads audio', 'HTTP 200, non-empty', out.ok ? 'GREEN' : 'RED', `download=${out.status ?? out.why}, size=${out.size}, type=${out.type}`)
  if (out.ok) {
    const outPath = f('cleaned-output.bin')
    writeFileSync(outPath, out.buf)
    const txt = spawnSync('ffmpeg', ['-hide_banner', '-i', outPath, '-af', 'ebur128', '-f', 'null', '-']).stderr?.toString() || ''
    const lufs = Number((txt.match(/I:\s+(-?[\d.]+) LUFS/g) || []).pop()?.match(/-?[\d.]+/)?.[0])
    record('CLN-P3', G, 'Output loudness ≈ targetLufs default (-16)', 'integrated LUFS within ±2 of -16', Number.isFinite(lufs) ? (Math.abs(lufs + 16) <= 2 ? 'GREEN' : 'RED') : 'INFO', `measured ${Number.isFinite(lufs) ? lufs : 'n/a'} LUFS`)
  }
  const params = [
    ['CLN-P4', 'targetLufs=-30 (min)', { targetLufs: -30 }], ['CLN-P5', 'targetLufs=-6 (max)', { targetLufs: -6 }],
    ['CLN-P6', 'cutoffFreq=20 (min)', { cutoffFreq: 20 }], ['CLN-P7', 'cutoffFreq=300 (max)', { cutoffFreq: 300 }],
    ['CLN-P8', 'qFactor=0.1 (min)', { qFactor: 0.1 }], ['CLN-P9', 'qFactor=5 (max)', { qFactor: 5 }],
    ['CLN-P10', 'truePeakDbfs=-6 (min)', { truePeakDbfs: -6 }], ['CLN-P11', 'truePeakDbfs=0 (max)', { truePeakDbfs: 0 }],
    ['CLN-P12', 'compressor options', { compThreshDb: -20, compRatio: 4, compAttackMs: 10, compReleaseMs: 100 }],
    ['CLN-P13', 'all params together', { targetLufs: -14, cutoffFreq: 80, qFactor: 1, truePeakDbfs: -1.5, compThreshDb: -18, compRatio: 3 }],
  ]
  for (const [id, title, fields] of params) {
    const r = await api('POST', P, { form: fileForm(f('tone.wav'), fields), timeout: 300000 })
    const rid = data(r)?.id ?? data(r)?.jobId
    if (rid) jobs.clean.push(rid)
    expectStatus(id, G, title, r, [200, 201, 202])
  }
  for (const ext of ['mp3', 'flac', 'ogg', 'm4a']) expectStatus(`CLN-F-${ext}`, G, `Format .${ext}`, await api('POST', P, { form: fileForm(f(`tone.${ext}`)), timeout: 300000 }), [200, 201, 202])

  const negs = [
    ['CLN-N1', 'targetLufs=-31', { targetLufs: -31 }], ['CLN-N2', 'targetLufs=-5', { targetLufs: -5 }], ['CLN-N3', 'targetLufs=0', { targetLufs: 0 }],
    ['CLN-N4', 'cutoffFreq=19', { cutoffFreq: 19 }], ['CLN-N5', 'cutoffFreq=301', { cutoffFreq: 301 }],
    ['CLN-N6', 'qFactor=0.09', { qFactor: 0.09 }], ['CLN-N7', 'qFactor=5.1', { qFactor: 5.1 }], ['CLN-N8', 'qFactor=0', { qFactor: 0 }],
    ['CLN-N9', 'truePeakDbfs=0.5', { truePeakDbfs: 0.5 }], ['CLN-N10', 'truePeakDbfs=-7', { truePeakDbfs: -7 }],
    ['CLN-N11', 'targetLufs="loud" (string)', { targetLufs: 'loud' }], ['CLN-N12', 'compRatio=0', { compRatio: 0 }],
    ['CLN-N13', 'compAttackMs=-5', { compAttackMs: -5 }], ['CLN-N14', 'compReleaseMs=-1', { compReleaseMs: -1 }],
  ]
  for (const [id, title, fields] of negs) expectReject(id, G, title, await api('POST', P, { form: fileForm(f('tone.wav'), fields) }))
  expectReject('CLN-N15', G, 'No file', await api('POST', P, { form: fileForm(null, { targetLufs: -16 }) }))
  expectReject('CLN-N16', G, 'Empty 0-byte file', await api('POST', P, { form: fileForm(f('empty.mp3')) }))
  expectStatus('CLN-N17', G, 'Corrupt bytes as .mp3', await api('POST', P, { form: fileForm(f('corrupt.mp3')) }), [400, 415, 422])
  expectStatus('CLN-N18', G, '.txt file', await api('POST', P, { form: fileForm(f('notes.txt')) }), [400, 415, 422])
  expectStatus('CLN-N19', G, 'JSON body instead of multipart', await api('POST', P, { body: { targetLufs: -16 } }), [400, 415, 422])
  if (HEAVY) {
    expectStatus('CLN-N20', G, '11-minute file (> 10 min limit)', await api('POST', P, { form: fileForm(f('long-11min.mp3')), timeout: 600000 }), [400, 413, 422])
    expectStatus('CLN-N21', G, '> 150 MB file', await api('POST', P, { form: fileForm(f('big-160mb.wav')), timeout: 600000 }), [400, 413, 422])
  } else record('CLN-N20', G, '> 10 min / > 150 MB limits', 'run with ECHONOVA_HEAVY=1', 'INFO', 'skipped (heavy)')
  expectStatus('CLN-N22', G, 'GET on POST-only /sound-cleaning', await api('GET', P), [404, 405])
  await authCases('CLN-P', G, 'POST', P, () => ({ form: fileForm(f('tone.wav')) }))

  await listCases('CLN', `${G} jobs`, '/v1/sound-cleaning/jobs', 'id')
  await jobByIdCases('CLN', `${G} jobs`, '/v1/sound-cleaning/jobs', jobs.clean[0])
}

// ───────────────────────── Main ─────────────────────────
async function main() {
  const probe = await api('GET', '/v1/text-to-speech/voices')
  if (probe.status === 0) throw new Error(`Cannot reach ${BASE}: ${probe.text}`)
  const f = buildFixtures()
  const { speechWav } = await tts(f)
  await stt(f, speechWav)
  await cleaning(f)

  const timed = results.filter((r) => r.ms != null).map((r) => r.ms).sort((a, b) => a - b)
  if (timed.length) {
    const p = (q) => timed[Math.min(timed.length - 1, Math.floor(timed.length * q))]
    record('NF-1', 'Perf', 'Response time (all calls)', 'for the record', 'INFO', `median=${p(0.5)} ms, p95=${p(0.95)} ms, max=${timed.at(-1)} ms over ${timed.length} calls`)
  }
  const nonJson = errorBodies.filter((e) => !e.json)
  record('NF-2', 'Consistency', 'Error bodies are JSON objects', `all ${errorBodies.length} 4xx/5xx bodies are JSON`, nonJson.length ? 'RED' : 'GREEN',
    nonJson.length ? `${nonJson.length} non-JSON, e.g. HTTP ${nonJson[0].status} ${nonJson[0].path}: ${nonJson[0].text}` : 'all JSON')
  const fiveXX = errorBodies.filter((e) => e.status >= 500)
  record('NF-3', 'Stability', 'No 5xx on bad input', '0 server errors', fiveXX.length ? 'RED' : 'GREEN',
    fiveXX.length ? `${fiveXX.length} × 5xx, e.g. ${fiveXX.slice(0, 3).map((e) => `${e.status} ${e.path}`).join(' | ')}` : 'none')
}

try {
  await main()
} catch (error) {
  record('X99', 'Runner', 'Suite crashed', 'no exception', 'RED', String(error?.stack || error))
} finally {
  const count = (v) => results.filter((r) => r.verdict === v).length
  const summary = { run: RUN, base: BASE, at: new Date().toISOString(), heavy: HEAVY, total: results.length, green: count('GREEN'), red: count('RED'), info: count('INFO'), jobs }
  writeFileSync(OUT, JSON.stringify({ summary, results }, null, 2))
  console.log('\n', JSON.stringify(summary))
}
