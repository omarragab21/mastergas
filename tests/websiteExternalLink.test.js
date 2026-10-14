import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveLink } from '../website/src/utils/externalLink.js';

test('external https/http links are detected and kept as-is', () => {
  assert.deepEqual(resolveLink('https://www.youtube.com/'), { external: true, href: 'https://www.youtube.com/' });
  assert.deepEqual(resolveLink('http://example.com/a?b=1'), { external: true, href: 'http://example.com/a?b=1' });
  assert.deepEqual(resolveLink('  https://example.com  '), { external: true, href: 'https://example.com' });
});

test('protocol-relative and www. links become https external links', () => {
  assert.deepEqual(resolveLink('//cdn.example.com/x'), { external: true, href: 'https://cdn.example.com/x' });
  assert.deepEqual(resolveLink('www.youtube.com/watch?v=1'), { external: true, href: 'https://www.youtube.com/watch?v=1' });
});

test('REGRESSION: the broken "/https://…" produced by router-link is treated as external too', () => {
  assert.deepEqual(resolveLink('/https://www.youtube.com/'), { external: true, href: 'https://www.youtube.com/' });
});

test('internal paths stay internal', () => {
  assert.deepEqual(resolveLink('/products'), { external: false, href: '/products' });
  assert.deepEqual(resolveLink('/products?sort_by=created_at'), { external: false, href: '/products?sort_by=created_at' });
  assert.deepEqual(resolveLink('products'), { external: false, href: '/products' });
});

test('empty or unsafe links fall back to the fallback path (javascript:/data: are never opened)', () => {
  for (const bad of [undefined, null, '', '   ', 'javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,x', 'vbscript:x']) {
    assert.deepEqual(resolveLink(bad), { external: false, href: '/products' }, String(bad));
  }
  assert.deepEqual(resolveLink('', '/'), { external: false, href: '/' });
});
