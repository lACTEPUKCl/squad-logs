import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { parseLine } from '../lib/index.js';
const prefix = '[2026.10.01-20.01.39:558][937]LogSquad: ';
const eos = 'a'.repeat(32), epic = 'b'.repeat(32), steam = '76561198000000000';
function parse(text, event) { const emitter = new EventEmitter(); let value; emitter.on(event, v => { assert.equal(value, undefined); value=v; }); parseLine(prefix+text,emitter); return value; }
test('captures and neutralizations retain owner/team/flag independently', () => {
  assert.equal(parse('Capture zone Walled Courts was fully captured by team 1','CAPTURE_ZONE_CAPTURED').flagName,'Walled Courts');
  const e=parse('Capture zone Walled Courts was neutralized by team 2 (was owned by team 1)','CAPTURE_ZONE_NEUTRALIZED');
  assert.equal(e.teamID,2);assert.equal(e.previousTeamID,1);
});
test('markers retain actor, destination team, coordinates and separate platform identities', () => {
  for (const platform of [`steam: ${steam}`,`epic: ${epic}`]) {
    const e=parse(`Player Игрок (Team: 1; ID: EOS: ${eos} ${platform}) placed a new map marker for team 2 : Type: BP_MapMarker_POI ; Location: -12.50000, 3.00000, 0.00000`,'MAP_MARKER_PLACED');
    assert.equal(e.teamID,1);assert.equal(e.markerTeamID,2);assert.equal(e.x,-12.5);
    assert.equal(e.steamID,platform.startsWith('steam')?steam:null);assert.equal(e.epicID,platform.startsWith('epic')?epic:null);
  }
});
test('deployable spawn accepts authored and world initialization variants', () => {
  const base='Deployable Wall_Sandbag spawned for team 1 at location {1.0, -2.5, 3.0}';
  const world=parse(base,'DEPLOYABLE_SPAWNED');assert.equal(world.name,null);assert.equal(world.steamID,null);
  const e=parse(base+` by player Игрок (ID: 4, OnlineIDs: EOS: ${eos} steam: ${steam})`,'DEPLOYABLE_SPAWNED');
  assert.equal(e.playerID,'4');assert.equal(e.steamID,steam);assert.equal(e.y,-2.5);
  assert.equal(parse(base.replace('1.0','NaN'),'DEPLOYABLE_SPAWNED'),undefined);
});
test('damage parses Player: without an intervening space', () => {
  const e=parse(`Player:Игрок ActualDamage=7.000000 from Attacker (Online IDs: EOS: ${eos} steam: ${steam} | Player Controller ID: BP_Controller_C)caused by BP_Rifle_C_12`,'PLAYER_DAMAGED');
  assert.equal(e.victimName,'Игрок');assert.equal(e.damage,7);
});
