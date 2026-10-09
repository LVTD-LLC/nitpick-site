import assert from 'node:assert/strict';
import { test } from 'node:test';
import { scrubProperties, safeUrl } from '../src/lib/analytics-policy.ts';

test('strips query, fragment, unknown paths and external referrer paths', () => {
  assert.equal(safeUrl('https://nitpick.sh/?email=secret@example.com#password'), 'https://nitpick.sh/');
  assert.equal(safeUrl('https://nitpick.sh/private-customer'), 'https://nitpick.sh/404');
  assert.equal(safeUrl('https://example.com/private?key=secret'), 'https://example.com');
  assert.equal(safeUrl('javascript:secret'), '');
});
test('drops unknown properties and sanitizes raw exceptions', () => {
  const clean = scrubProperties({
    '$current_url': 'https://nitpick.sh/?secret=PRIVATE_MARKER', '$pathname': '/PRIVATE_MARKER',
    '$exception_message': 'PRIVATE_MARKER', prompt: 'PRIVATE_MARKER', '$set': { email: 'PRIVATE_MARKER' },
    '$exception_list': [{ type: 'PRIVATE_MARKER', value: 'PRIVATE_MARKER', stacktrace: { frames: [{
      filename: 'https://private.test/PRIVATE_MARKER', function: 'PRIVATE_MARKER', context_line: 'PRIVATE_MARKER', lineno: 3,
    }] } }],
  });
  assert.ok(!JSON.stringify(clean).includes('PRIVATE_MARKER'));
  assert.equal(clean.source, 'web');
});

test('redacted stack frames retain required PostHog manual-capture schema', () => {
  const clean = scrubProperties({ '$exception_list': [{ type: 'TypeError', value: 'secret', stacktrace: { frames: [{ filename: 'https://nitpick.sh/_astro/app.js?secret=value', lineno: 7, colno: 2 }] } }] });
  const frame = clean.$exception_list[0].stacktrace.frames[0];
  assert.equal(frame.platform, 'custom');
  assert.equal(frame.lang, 'javascript');
  assert.equal(frame.function, 'redacted');
  assert.equal(frame.filename, 'https://nitpick.sh/_astro/app.js');
});
