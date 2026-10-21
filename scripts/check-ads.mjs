import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const config = JSON.parse(await readFile('src/config/advertising.json', 'utf8'));
assert.equal(typeof config.enabled, 'boolean');
assert(!config.publisherId || /^ca-pub-\d{16}$/.test(config.publisherId), 'Invalid AdSense publisher ID');
for (const [name, id] of Object.entries(config.units)) assert(!id || /^\d{10}$/.test(id), `Invalid ad unit: ${name}`);
if (config.enabled) {
  assert(config.publisherId, 'Configure the real AdSense publisher first');
  assert(config.consentMessagePublished, 'Publish and verify the Google CMP first');
  assert(config.manualPlacementsConfirmed, 'Confirm manual-only placements in AdSense first');
  for (const [name, id] of Object.entries(config.units)) assert(id, `Missing ad unit: ${name}`);
}
console.log(`AdSense configuration valid: ${config.enabled ? 'enabled' : 'prepared, not serving ads'}. ${Object.values(config.units).filter(Boolean).length}/${Object.keys(config.units).length} ad units configured.`);
