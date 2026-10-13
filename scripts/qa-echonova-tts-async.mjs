#!/usr/bin/env node
// Live contract/QA suite for EchoNova  POST /v1/text-to-speech  (async TTS job).
// WARNING: hits the real API and consumes credits (1 credit / character). Never wire into `npm test`.
//
// Usage:
//   ECHONOVA_API_KEY=... node scripts/qa-echonova-tts-async.mjs [out-basename]
//   -> writes <out-basename>.json and <out-basename>.md  (default reports/echonova-tts-async-qa)
// Optional env:
//   ECHONOVA_API_BASE         default https://api.echonova.ai
//   ECHONOVA_WEBHOOK_URL      a public URL you control (webhook.site etc.) — enables E9 (manual check, logged)
//   ECHONOVA_EMPTY_KEY        an API key whose credit balance is 0           — enables R2
//   ECHONOVA_REVOKED_KEY      a revoked/expired API key                       — enables A5
//   ECHONOVA_SKIP_LOAD=1      skip rate-limit burst (R3) and parallel jobs (E8)
//
// Contract under test (from https://echonova.ai/docs/reference/tts-generate-async):
//   body: text (1..500 chars after trim, required), voiceId (required), speed 0.5..2 (def 1), cfg 1..5 (def 2),
//         numSteps in {16,32,64,128} (def 32), tashkeel boolean (def false)
//   200:  { data:{ jobId, status:"processing" }, success:true, statusCode:200, errorMessage:null }

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

const BASE = (process.env.ECHONOVA_API_BASE || 'https://api.echonova.ai').replace(/\/$/, '')
const KEY = process.env.ECHONOVA_API_KEY
const OUT = process.argv[2] || 'reports/echonova-tts-async-qa'
const SKIP_LOAD = process.env.ECHONOVA_SKIP_LOAD === '1'
const WEBHOOK = process.env.ECHONOVA_WEBHOOK_URL
const RUN = `QA-TTS-${Date.now().toString(36).toUpperCase()}`
const EP = '/v1/text-to-speech'
const POLL_TIMEOUT_MS = 240000

if (!KEY) { console.error('Set ECHONOVA_API_KEY'); process.exit(2) }

const results = []
const createdJobs = []
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const brief = (v, max = 240) => { const s = typeof v === 'string' ? v : JSON.stringify(v); return s && s.length > max ? `${s.slice(0, max)}…` : s }
const redact = (s) => String(s).split(KEY).join('<API_KEY>')

async function api(method, path, { body, rawBody, contentType, form, auth = true, bearer, rawAuth, timeout = 60000 } = {}) {
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
  try { res = await fetch(`${BASE}${path}`, { method, headers, body: payload, signal: AbortSignal.timeout(timeout) }) }
  catch (e) { return { status: 0, json: null, text: String(e?.cause || e), ms: Date.now() - started, headers: {} } }
  const text = await res.text()
  let json = null
  try { json = JSON.parse(text) } catch { /* non-JSON */ }
  return { status: res.status, json, text, ms: Date.now() - started, headers: Object.fromEntries(res.headers) }
}

const d = (res) => res.json?.data
const leaks = (res) => /traceback|stack trace|\.py", line|at \S+ \(\S+:\d+:\d+\)|node_modules|ECONN|ENOTFOUND|mongo|sequelize|SELECT .* FROM/i.test(res?.text || '')
const errMsg = (res) => brief(res.json?.errorMessage ?? res.json?.message ?? res.json?.error ?? res.text, 200)

/** verdict: GREEN = as expected, RED = defect, INFO = behaviour to confirm with the API owner. */
function record(id, group, title, expected, verdict, actual, res, sample) {
  const row = { id, group, title, expected, verdict, actual: redact(actual), http: res?.status ?? null, ms: res?.ms ?? null, sample: sample ? redact(JSON.stringify(sample)) : undefined }
  results.push(row)
  console.log(`${verdict === 'GREEN' ? '🟢' : verdict === 'RED' ? '🔴' : '🔵'} ${id} ${title} → ${row.actual}`)
  return row
}

/** Checks the documented response envelope. Returns list of problems. */
function envelopeProblems(res, ok) {
  const j = res.json, p = []
  if (!j || typeof j !== 'object') return ['body is not a JSON object']
  if (typeof j.success !== 'boolean') p.push('missing boolean `success`')
  else if (j.success !== ok) p.push(`success=${j.success}, expected ${ok}`)
  if (typeof j.statusCode !== 'number') p.push('missing numeric `statusCode`')
  else if (j.statusCode !== res.status) p.push(`body.statusCode=${j.statusCode} ≠ HTTP ${res.status}`)
  if (!('errorMessage' in j)) p.push('missing `errorMessage`')
  else if (ok && j.errorMessage !== null) p.push(`errorMessage should be null, got "${j.errorMessage}"`)
  else if (!ok && !(typeof j.errorMessage === 'string' && j.errorMessage.trim())) p.push('errorMessage empty on failure')
  return p
}

/** Request must be REJECTED (4xx) with a proper error envelope and no leak. */
async function reject(id, group, title, send, { want = [400, 422], note = '' } = {}) {
  const res = await send()
  const bad = []
  if (!want.includes(res.status)) bad.push(`HTTP ${res.status} (want ${want.join('/')})`)
  else bad.push(...envelopeProblems(res, false))
  if (leaks(res)) bad.push('LEAKS internals')
  if (res.status < 400 && d(res)?.jobId) createdJobs.push(d(res).jobId)
  record(id, group, title, `HTTP ${want.join('/')}, success=false, errorMessage${note ? ` — ${note}` : ''}`, bad.length ? 'RED' : 'GREEN',
    bad.length ? `${bad.join('; ')} | ${errMsg(res)}` : `HTTP ${res.status} "${errMsg(res)}"`, res, { status: res.status, body: res.json ?? res.text })
  return res
}

/** Request must be ACCEPTED: 200 + full envelope + jobId + status=processing. */
async function accept(id, group, title, send, note = '') {
  const res = await send()
  const bad = []
  if (res.status !== 200) bad.push(`HTTP ${res.status}`)
  else {
    bad.push(...envelopeProblems(res, true))
    if (typeof d(res)?.jobId !== 'string' || !d(res).jobId) bad.push('no jobId')
    if (d(res)?.status !== 'processing') bad.push(`status=${d(res)?.status}`)
  }
  if (leaks(res)) bad.push('LEAKS internals')
  if (d(res)?.jobId) createdJobs.push(d(res).jobId)
  record(id, group, title, `HTTP 200, success=true, data.jobId, data.status="processing"${note ? ` — ${note}` : ''}`, bad.length ? 'RED' : 'GREEN',
    bad.length ? `${bad.join('; ')} | ${errMsg(res)}` : `jobId=${d(res).jobId} (${res.ms} ms)`, res, { status: res.status, body: res.json ?? res.text })
  return res
}

async function poll(jobId) {
  const started = Date.now()
  let last
  while (Date.now() - started < POLL_TIMEOUT_MS) {
    last = await api('GET', `${EP}/jobs/${jobId}`)
    const st = String(d(last)?.status || '').toLowerCase()
    if (last.status !== 200 || ['completed', 'failed', 'error'].includes(st)) break
    await sleep(2500)
  }
  last.waitedMs = Date.now() - started
  return last
}

async function wav(url) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(60000) })
    const buf = Buffer.from(await r.arrayBuffer())
    const ok = buf.length > 44 && buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WAVE'
    return { http: r.status, size: buf.length, ok, seconds: ok ? (buf.length - 44) / (buf.readUInt32LE(28) || 1) : null }
  } catch (e) { return { http: 0, size: 0, ok: false, why: String(e) } }
}

const total = async () => { const r = await api('GET', `${EP}/jobs?limit=1`); return r.json?.data?.total ?? r.json?.total }

// ───────────────────────── main ─────────────────────────
async function main() {
  // Pre-flight: voices
  const vr = await api('GET', `${EP}/voices`)
  if (vr.status === 0) throw new Error(`Cannot reach ${BASE}: ${vr.text}`)
  const voices = vr.json?.data?.items || vr.json?.items || (Array.isArray(vr.json?.data) ? vr.json.data : [])
  record('PRE-1', 'Setup', 'Fetch voice catalogue (needed for voiceId)', 'HTTP 200, ≥1 voice', vr.status === 200 && voices.length ? 'GREEN' : 'RED',
    `HTTP ${vr.status}, ${voices.length} voices: ${voices.map((v) => `${v.id}[${v.language}/${v.gender}]`).join(', ')}`, vr)
  if (!voices.length) return
  const isMsa = (v) => /msa|fusha|فصحى|standard/i.test(`${v.id} ${v.name} ${v.displayName}`)
  const arabic = voices.filter((v) => /^ar/i.test(v.language))
  const msa = voices.find(isMsa) || arabic[0] || voices[0]
  const english = voices.find((v) => /^en/i.test(v.language)) || voices[0]
  const dialects = arabic.filter((v) => v.id !== msa.id)
  const VID = msa.id
  const AR = 'مرحبا بكم في اختبار جودة منصة إيكو نوفا.'
  const ok = (body) => () => api('POST', EP, { body })
  const base = { text: AR, voiceId: VID }

  // ───── Positive ─────
  const G1 = 'Positive'
  const p1 = await accept('P1', G1, 'Minimum body (text + voiceId only)', ok(base))
  await accept('P2', G1, 'All fields: speed 1.5, cfg 3, numSteps 64, tashkeel true', ok({ ...base, speed: 1.5, cfg: 3, numSteps: 64, tashkeel: true }))
  await accept('P3', G1, `Arabic text, MSA voice (${msa.id})`, ok(base))
  await accept('P4', G1, `English text, English voice (${english.id})`, ok({ text: 'Welcome to the EchoNova quality test.', voiceId: english.id }))
  for (const v of dialects) await accept(`P5-${v.id}`, G1, `Dialect voice ${v.displayName || v.name} (${v.id})`, ok({ text: AR, voiceId: v.id }))
  await accept('P6', G1, 'Mixed Arabic/English + digits', ok({ text: 'السعر 250 جنيه for the premium plan 2026.', voiceId: VID }))
  await accept('P7a', G1, 'text = 1 character', ok({ text: 'أ', voiceId: VID }))
  await accept('P7b', G1, 'text = exactly 500 characters', ok({ text: 'ا'.repeat(500), voiceId: VID }))
  await accept('P8', G1, 'text = 500 chars padded with spaces (limit applies after trim)', ok({ text: `   ${'ا'.repeat(500)}   `, voiceId: VID }))
  for (const s of [0.5, 1, 2.0]) await accept(`P9-${s}`, G1, `speed = ${s}`, ok({ ...base, speed: s }))
  for (const c of [1, 2, 5]) await accept(`P10-${c}`, G1, `cfg = ${c}`, ok({ ...base, cfg: c }))
  for (const n of [16, 32, 64, 128]) await accept(`P11-${n}`, G1, `numSteps = ${n}`, ok({ ...base, numSteps: n }))
  for (const t of [true, false]) await accept(`P12-${t}`, G1, `tashkeel = ${t}`, ok({ ...base, tashkeel: t }))
  await accept('P13', G1, 'Symbols / emoji / punctuation in text', ok({ text: 'مرحبا 👋 "اختبار" & <b>test</b> — 100%؟!', voiceId: VID }))
  const p14 = await Promise.all([api('POST', EP, { body: base }), api('POST', EP, { body: base })])
  const ids = p14.map((r) => d(r)?.jobId)
  p14.forEach((r) => d(r)?.jobId && createdJobs.push(d(r).jobId))
  record('P14', G1, 'Two identical requests → two distinct jobIds', 'different jobIds', ids[0] && ids[1] && ids[0] !== ids[1] ? 'GREEN' : 'RED', `ids=${ids.join(' , ')}`)
  record('P15', G1, 'Create returns immediately (async)', '< 3000 ms', p1.ms < 3000 ? 'GREEN' : 'RED', `${p1.ms} ms`, p1)
  record('P16', G1, 'jobId format (for the record)', 'stable id string', 'INFO', `"${d(p1)?.jobId}" (${String(d(p1)?.jobId).length} chars, ${/^[0-9a-f]{24}$/i.test(d(p1)?.jobId) ? 'ObjectId-like' : 'other'})`)
  record('P17', G1, 'Response headers (for the record)', 'JSON content-type', /json/i.test(p1.headers['content-type'] || '') ? 'GREEN' : 'RED', `content-type=${p1.headers['content-type']}`, p1)

  // ───── End-to-end lifecycle ─────
  const G2 = 'Lifecycle'
  const text10 = 'ا'.repeat(40)
  const e1r = await api('POST', EP, { body: { text: text10, voiceId: VID } })
  const jid = d(e1r)?.jobId
  if (jid) {
    createdJobs.push(jid)
    const done = await poll(jid)
    const dd = d(done)
    record('E1', G2, 'Polling GET /jobs/{id} → completed', 'status processing → completed', dd?.status === 'completed' ? 'GREEN' : 'RED', `final status=${dd?.status}, waited ${done.waitedMs} ms ${dd?.status === 'completed' ? '' : errMsg(done)}`, done)
    record('E2', G2, 'Completed job exposes audioUrl', 'audioUrl present', dd?.audioUrl ? 'GREEN' : 'RED', `audioUrl=${dd?.audioUrl ? 'yes' : 'no'}`, done)
    if (dd?.audioUrl) {
      const w = await wav(dd.audioUrl)
      record('E3', G2, 'audioUrl is a valid WAV', 'HTTP 200 + RIFF/WAVE', w.http === 200 && w.ok ? 'GREEN' : 'RED', `HTTP ${w.http}, ${w.size} bytes, wav=${w.ok}, ≈${w.seconds?.toFixed?.(2)} s`)
      if (dd.durationSeconds != null && w.seconds) record('E4', G2, 'durationSeconds matches real audio length', '±0.5 s', Math.abs(dd.durationSeconds - w.seconds) <= 0.5 ? 'GREEN' : 'RED', `reported=${dd.durationSeconds}, actual≈${w.seconds.toFixed(2)}`)
      const bare = await fetch(dd.audioUrl.split('?')[0], { signal: AbortSignal.timeout(30000) }).then((r) => r.status).catch(() => 0)
      record('E10', G2, 'audioUrl without its signature is not publicly readable', '401/403/404', [400, 401, 403, 404].includes(bare) ? 'GREEN' : 'INFO', `unsigned → HTTP ${bare}`)
    }
    record('E5', G2, `creditsConsumed = character count (${text10.length})`, `${text10.length} (1 credit / char)`, dd?.creditsConsumed === text10.length ? 'GREEN' : dd?.creditsConsumed == null ? 'INFO' : 'RED', `creditsConsumed=${dd?.creditsConsumed}`, done)
    const fields = ['jobId', 'status'].filter((k) => dd?.[k] === undefined && dd?.id === undefined)
    record('E5b', G2, 'Job detail shape (for the record)', 'jobId/status/audioUrl/durationSeconds/creditsConsumed', fields.length ? 'RED' : 'INFO', `keys=${Object.keys(dd || {}).join(',')}`, done)
  } else record('E1', G2, 'Polling lifecycle', 'needs a created job', 'RED', 'could not create the job')

  const speeds = {}
  for (const s of [0.5, 2]) {
    const r = await api('POST', EP, { body: { ...base, speed: s } })
    if (d(r)?.jobId) { createdJobs.push(d(r).jobId); speeds[s] = d(await poll(d(r).jobId))?.durationSeconds }
  }
  if (speeds[0.5] && speeds[2]) record('E4b', G2, 'speed really changes duration', 'duration(0.5) > duration(2.0)', speeds[0.5] > speeds[2] ? 'GREEN' : 'RED', `0.5→${speeds[0.5]}s  2.0→${speeds[2]}s`)

  const list = await api('GET', `${EP}/jobs?limit=50`)
  const inList = (list.json?.data?.items || list.json?.items || []).some((j) => (j.jobId ?? j.id) === jid)
  record('E6', G2, 'Created job appears in GET /jobs', 'present', inList ? 'GREEN' : 'RED', `found=${inList}`, list)

  if (!SKIP_LOAD) {
    const batch = await Promise.all(Array.from({ length: 5 }, () => api('POST', EP, { body: base })))
    const bids = batch.map((r) => d(r)?.jobId).filter(Boolean)
    bids.forEach((i) => createdJobs.push(i))
    const finals = await Promise.all(bids.map(poll))
    const okAll = bids.length === 5 && finals.every((f) => d(f)?.status === 'completed')
    record('E8', G2, '5 parallel jobs all complete', '5/5 completed', okAll ? 'GREEN' : 'RED', `created=${bids.length}, completed=${finals.filter((f) => d(f)?.status === 'completed').length}`)
  }
  if (WEBHOOK) record('E9', G2, 'Webhook delivery', 'manual: check your receiver for the callback with WAV link', 'INFO', `receiver=${WEBHOOK} — registration method is not in the endpoint contract; verify manually, exactly once per job`)
  else record('E9', G2, 'Webhook delivery', 'needs ECHONOVA_WEBHOOK_URL + registration method', 'INFO', 'not executed — contract does not show how a webhook URL is registered')

  // ───── Negative: validation ─────
  const G3 = 'Negative'
  const post = (body) => () => api('POST', EP, { body })
  await reject('N1', G3, 'Missing text', post({ voiceId: VID }))
  await reject('N2', G3, 'text = ""', post({ text: '', voiceId: VID }))
  await reject('N3', G3, 'text = whitespace only', post({ text: '     ', voiceId: VID }))
  await reject('N3b', G3, 'text = tabs/newlines only', post({ text: '\n\t \r\n', voiceId: VID }))
  await reject('N4', G3, 'text = 501 chars', post({ text: 'ا'.repeat(501), voiceId: VID }))
  await reject('N6', G3, 'text = 501 chars + surrounding spaces', post({ text: `  ${'ا'.repeat(501)}  `, voiceId: VID }))
  await reject('N4b', G3, 'text = 5000 chars', post({ text: 'ا'.repeat(5000), voiceId: VID }))
  for (const [k, v] of [['number', 12345], ['array', ['a']], ['object', { a: 1 }], ['null', null], ['boolean', true]]) await reject(`N7-${k}`, G3, `text as ${k}`, post({ text: v, voiceId: VID }))
  await accept('N8', G3, 'text containing HTML/script is treated as plain text', ok({ text: '<script>alert(1)</script> مرحبا', voiceId: VID }), 'no 500, no execution')
  await reject('N9', G3, 'text containing NUL byte', post({ text: 'مرحبا\u0000بكم', voiceId: VID }), { want: [200, 400, 422], note: 'clean reject or sanitised accept — never 500' }).then(async (r) => { if (r.status === 200) results.at(-1).verdict = 'INFO' })
  await reject('N10', G3, 'Missing voiceId', post({ text: AR }))
  await reject('N11', G3, 'Unknown voiceId', post({ text: AR, voiceId: 'voice_does_not_exist_000' }), { want: [400, 404, 422] })
  await reject('N12a', G3, 'voiceId = ""', post({ text: AR, voiceId: '' }))
  await reject('N12b', G3, 'voiceId as number', post({ text: AR, voiceId: 1 }))
  await reject('N12c', G3, 'voiceId = null', post({ text: AR, voiceId: null }))
  await reject('N10b', G3, 'voiceId with injection payload', post({ text: AR, voiceId: "' OR 1=1 --" }), { want: [400, 404, 422] })
  await reject('N10c', G3, 'voiceId with NoSQL payload', post({ text: AR, voiceId: { $ne: null } }))
  for (const s of [0.4, 0.49, 2.01, 2.1, 0, -1]) await reject(`N14-${s}`, G3, `speed = ${s}`, post({ ...base, speed: s }))
  await reject('N15', G3, 'speed = "fast"', post({ ...base, speed: 'fast' }))
  for (const c of [0, 0.9, 5.1, 6, -2]) await reject(`N16-${c}`, G3, `cfg = ${c}`, post({ ...base, cfg: c }))
  for (const n of [0, 8, 20, 31, 33, 256, -32]) await reject(`N17-${n}`, G3, `numSteps = ${n}`, post({ ...base, numSteps: n }), { note: 'only 16/32/64/128 allowed' })
  await reject('N18a', G3, 'numSteps = 32.5', post({ ...base, numSteps: 32.5 }))
  await reject('N18b', G3, 'numSteps = "32" (string)', post({ ...base, numSteps: '32' }))
  for (const [k, v] of [['"true"', 'true'], ['1', 1], ['"yes"', 'yes'], ['0', 0]]) await reject(`N19-${k}`, G3, `tashkeel = ${k} (not boolean)`, post({ ...base, tashkeel: v }))
  for (const f of ['speed', 'cfg', 'numSteps', 'tashkeel']) {
    const r = await api('POST', EP, { body: { ...base, [f]: null } })
    if (d(r)?.jobId) createdJobs.push(d(r).jobId)
    record(`N20-${f}`, G3, `${f} = null`, 'default applied (200) or clean 4xx — never 5xx', r.status < 500 && !leaks(r) ? (r.status === 200 ? 'INFO' : 'GREEN') : 'RED', `HTTP ${r.status} ${errMsg(r)}`, r)
  }
  if (dialects[0]) {
    const r = await api('POST', EP, { body: { text: AR, voiceId: dialects[0].id, tashkeel: true } })
    if (d(r)?.jobId) createdJobs.push(d(r).jobId)
    record('N19c', G3, `tashkeel=true with dialect voice (${dialects[0].id})`, 'docs: tashkeel is for MSA — accept/ignore (200) or reject (4xx), never 5xx', r.status < 500 ? 'INFO' : 'RED', `HTTP ${r.status} ${errMsg(r)}`, r)
  }
  await reject('N21', G3, 'Malformed JSON', () => api('POST', EP, { rawBody: '{"text": "مرحبا", "voiceId":' }))
  await reject('N21b', G3, 'JSON array instead of object', () => api('POST', EP, { rawBody: '[]' }))
  await reject('N22a', G3, 'Empty body', () => api('POST', EP, { rawBody: '' }))
  await reject('N22b', G3, 'Body = {}', post({}))
  await reject('N23a', G3, 'Content-Type text/plain', () => api('POST', EP, { rawBody: JSON.stringify(base), contentType: 'text/plain' }), { want: [400, 415, 422] })
  await reject('N23b', G3, 'Content-Type application/x-www-form-urlencoded', () => api('POST', EP, { rawBody: `text=${encodeURIComponent(AR)}&voiceId=${VID}`, contentType: 'application/x-www-form-urlencoded' }), { want: [400, 415, 422] })
  const unk = await api('POST', EP, { body: { ...base, foo: 'bar', __proto__: { x: 1 } } })
  if (d(unk)?.jobId) createdJobs.push(d(unk).jobId)
  record('N24', G3, 'Unknown extra field', 'ignored (200) or rejected (4xx) — never 5xx', unk.status < 500 ? (unk.status === 200 ? 'INFO' : 'GREEN') : 'RED', `HTTP ${unk.status}`, unk)
  const big = await api('POST', EP, { body: { ...base, pad: 'x'.repeat(5 * 1024 * 1024) }, timeout: 120000 })
  if (d(big)?.jobId) createdJobs.push(d(big).jobId)
  record('R9', 'Security', '5 MB request body', '413/400/422 (or ignored) — never 5xx', big.status < 500 && big.status !== 0 ? 'GREEN' : 'RED', `HTTP ${big.status} ${errMsg(big)}`, big)
  for (const m of ['PUT', 'PATCH', 'DELETE']) {
    const r = await api(m, EP, { body: base })
    record(`N25-${m}`, G3, `${m} ${EP}`, '404/405', [404, 405].includes(r.status) ? 'GREEN' : 'RED', `HTTP ${r.status}`, r)
  }

  // ───── Auth ─────
  const G4 = 'Auth'
  const as = (o) => () => api('POST', EP, { body: base, ...o })
  await reject('A1', G4, 'No Authorization header', as({ auth: false }), { want: [401] })
  await reject('A2', G4, 'Invalid API key', as({ bearer: 'ek_invalid_key_000000000000' }), { want: [401, 403] })
  await reject('A3', G4, 'Key without "Bearer " prefix', as({ rawAuth: KEY }), { want: [401, 403] })
  await reject('A4', G4, '"Bearer " with empty token', as({ rawAuth: 'Bearer ' }), { want: [401, 403] })
  await reject('A6a', G4, 'Valid key + 1 extra char', as({ bearer: `${KEY}x` }), { want: [401, 403] })
  await reject('A6b', G4, 'Valid key truncated by 1 char', as({ bearer: KEY.slice(0, -1) }), { want: [401, 403] })
  await reject('A7', G4, 'Wrong scheme (Basic)', as({ rawAuth: `Basic ${Buffer.from(`x:${KEY}`).toString('base64')}` }), { want: [401, 403] })
  if (process.env.ECHONOVA_REVOKED_KEY) await reject('A5', G4, 'Revoked/expired key', as({ bearer: process.env.ECHONOVA_REVOKED_KEY }), { want: [401, 403] })
  else record('A5', G4, 'Revoked/expired key', 'needs ECHONOVA_REVOKED_KEY', 'INFO', 'not executed')

  // ───── Billing / limits ─────
  const G5 = 'Billing & limits'
  const t0 = await total()
  for (const body of [{ voiceId: VID }, { text: '', voiceId: VID }, { text: 'ا'.repeat(501), voiceId: VID }, { text: AR, voiceId: 'nope_000' }, { ...base, speed: 9 }, { ...base, numSteps: 20 }]) await api('POST', EP, { body })
  const t1 = await total()
  record('R1', G5, 'Rejected requests create no job and cost no credits', `jobs total unchanged (${t0})`, t0 == null || t1 == null ? 'INFO' : t0 === t1 ? 'GREEN' : 'RED', `total before=${t0}, after 6 invalid requests=${t1}`)
  if (process.env.ECHONOVA_EMPTY_KEY) await reject('R2', G5, 'Insufficient credits (empty-balance key)', as({ bearer: process.env.ECHONOVA_EMPTY_KEY }), { want: [402, 403, 429], note: 'clear "insufficient credits" message, never 500' })
  else record('R2', G5, 'Insufficient credits', 'needs ECHONOVA_EMPTY_KEY', 'INFO', 'not executed')
  if (!SKIP_LOAD) {
    const burst = await Promise.all(Array.from({ length: 40 }, () => api('POST', EP, { body: { text: 'ا', voiceId: VID } })))
    burst.forEach((r) => d(r)?.jobId && createdJobs.push(d(r).jobId))
    const codes = burst.reduce((m, r) => ({ ...m, [r.status]: (m[r.status] || 0) + 1 }), {})
    const has5xx = burst.some((r) => r.status >= 500 || r.status === 0)
    const r429 = burst.find((r) => r.status === 429)
    record('R3', G5, '40 requests in parallel (rate limiting)', 'all 200, or 429 with Retry-After — never 5xx', has5xx ? 'RED' : r429 ? (r429.headers['retry-after'] ? 'GREEN' : 'INFO') : 'INFO', `status counts=${JSON.stringify(codes)}${r429 ? `, Retry-After=${r429.headers['retry-after']}` : ' (no rate limit hit at this volume)'}`)
  }
  const ts = results.filter((r) => r.http >= 400 && r.id !== 'PRE-1')
  record('R6', G5, 'All error responses use the envelope {success:false, statusCode, errorMessage}', 'consistent', ts.every((r) => !/body is not a JSON|missing/i.test(r.actual)) ? 'GREEN' : 'RED', `${ts.filter((r) => /body is not a JSON|missing/i.test(r.actual)).length} of ${ts.length} error responses deviate`)
  record('R7', G5, 'No internals leaked in any response', '0 leaks', results.some((r) => /LEAKS/.test(r.actual)) ? 'RED' : 'GREEN', `${results.filter((r) => /LEAKS/.test(r.actual)).length} leaking responses`)
  record('R10', G5, 'No 5xx anywhere in the run', '0 server errors', results.some((r) => r.http >= 500) ? 'RED' : 'GREEN', `${results.filter((r) => r.http >= 500).length} × 5xx: ${results.filter((r) => r.http >= 500).slice(0, 5).map((r) => r.id).join(', ')}`)
}

// ───────────────────────── report ─────────────────────────
function markdown(summary) {
  const L = []
  const icon = { GREEN: '🟢 PASS', RED: '🔴 FAIL', INFO: '🔵 INFO' }
  const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ')
  L.push(`# EchoNova — Async TTS API QA Report`, '', `**Endpoint:** \`POST ${BASE}${EP}\`  `, `**Run:** ${summary.run} · ${summary.at}  `, `**Executed by:** automated suite \`scripts/qa-echonova-tts-async.mjs\``, '')
  const verdict = summary.red === 0 ? '✅ **PASS** — no defects found' : `❌ **FAIL** — ${summary.red} defect(s) found`
  L.push('## 1. Executive summary', '', verdict, '', '| Total | 🟢 Pass | 🔴 Fail | 🔵 Info |', '|---|---|---|---|', `| ${summary.total} | ${summary.green} | ${summary.red} | ${summary.info} |`, '')
  const groups = [...new Set(results.map((r) => r.group))]
  L.push('| Group | Pass | Fail | Info |', '|---|---|---|---|')
  for (const g of groups) { const rs = results.filter((r) => r.group === g); L.push(`| ${g} | ${rs.filter((r) => r.verdict === 'GREEN').length} | ${rs.filter((r) => r.verdict === 'RED').length} | ${rs.filter((r) => r.verdict === 'INFO').length} |`) }
  const reds = results.filter((r) => r.verdict === 'RED')
  L.push('', '## 2. Defects (🔴)', '')
  if (!reds.length) L.push('None.')
  else { L.push('| ID | Scenario | Expected | Actual |', '|---|---|---|---|'); reds.forEach((r) => L.push(`| ${r.id} | ${esc(r.title)} | ${esc(r.expected)} | ${esc(r.actual)} |`)) }
  const infos = results.filter((r) => r.verdict === 'INFO')
  L.push('', '## 3. Behaviours to confirm with the API owner (🔵)', '')
  if (!infos.length) L.push('None.')
  else { L.push('| ID | Scenario | Observation |', '|---|---|---|'); infos.forEach((r) => L.push(`| ${r.id} | ${esc(r.title)} | ${esc(r.actual)} |`)) }
  L.push('', '## 4. What works (🟢)', '', '| ID | Scenario | Result |', '|---|---|---|')
  results.filter((r) => r.verdict === 'GREEN').forEach((r) => L.push(`| ${r.id} | ${esc(r.title)} | ${esc(r.actual)} |`))
  const t = results.filter((r) => r.ms != null).map((r) => r.ms).sort((a, b) => a - b)
  if (t.length) L.push('', '## 5. Performance', '', `Median ${t[Math.floor(t.length / 2)]} ms · p95 ${t[Math.floor(t.length * 0.95)]} ms · max ${t.at(-1)} ms over ${t.length} calls (create-job is asynchronous; E1 lists time-to-completed).`)
  L.push('', '## 6. Evidence (raw request outcomes for failures)', '')
  reds.slice(0, 30).forEach((r) => L.push(`- **${r.id}** ${esc(r.title)} → \`${esc(r.sample ?? r.actual).slice(0, 400)}\``))
  L.push('', '## 7. Not executed / needs input', '', ...results.filter((r) => /not executed|needs /.test(r.actual + r.expected)).map((r) => `- **${r.id}** ${esc(r.title)} — ${esc(r.expected)}`))
  L.push('', `Jobs created during the run (${createdJobs.length}): ${createdJobs.slice(0, 20).join(', ')}${createdJobs.length > 20 ? ', …' : ''}`)
  return L.join('\n')
}

try { await main() } catch (e) { record('X99', 'Runner', 'Suite crashed', 'no exception', 'RED', String(e?.stack || e)) }
finally {
  const n = (v) => results.filter((r) => r.verdict === v).length
  const summary = { run: RUN, base: BASE, at: new Date().toISOString(), total: results.length, green: n('GREEN'), red: n('RED'), info: n('INFO'), createdJobs: createdJobs.length }
  mkdirSync(dirname(OUT), { recursive: true })
  writeFileSync(`${OUT}.json`, JSON.stringify({ summary, results }, null, 2))
  writeFileSync(`${OUT}.md`, markdown(summary))
  console.log('\n', JSON.stringify(summary), `\nReport: ${OUT}.md`)
}
