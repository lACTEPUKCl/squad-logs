import { LogsReaderEvents } from '../../events';
import {
  TCaptureZone,
  TDeployableSpawned,
  TMapMarkerPlaced,
} from '../../types';

const identity = (text: string) => ({
  eosID: text.match(/\bEOS:\s*([a-f0-9]{32})\b/i)?.[1] || null,
  steamID: text.match(/\bsteam:\s*(\d{17})\b/i)?.[1] || null,
  epicID: text.match(/\bepic:\s*([a-f0-9]{32})\b/i)?.[1] || null,
});

export function worldActivity(
  line: string,
): TCaptureZone | TMapMarkerPlaced | TDeployableSpawned | null {
  const head = line.match(
    /^\[([0-9.:-]+)]\[([ 0-9]*)]LogSquad:\s*(.*)$/,
  );
  if (!head) return null;
  const common = { raw: line, time: head[1], chainID: head[2] };
  const text = head[3];
  const zone = text.match(
    /^Capture zone (.+) was (?:fully captured by team (\d+)|neutralized by team (\d+) \(was owned by team (\d+)\))$/,
  );
  if (zone)
    return {
      ...common,
      event: zone[2]
        ? LogsReaderEvents.CAPTURE_ZONE_CAPTURED
        : LogsReaderEvents.CAPTURE_ZONE_NEUTRALIZED,
      flagName: zone[1],
      teamID: Number(zone[2] || zone[3]),
      previousTeamID: zone[4] ? Number(zone[4]) : null,
    };
  const marker = text.match(
    /^Player (.+?) \(Team: (\d+); ID: (.+?)\) placed a new map marker for team (\d+)\s*:\s*Type:\s*(.+?)\s*;\s*Location:\s*([^,]+),\s*([^,]+),\s*([^,]+)$/,
  );
  if (marker) {
    const [x, y, z] = marker.slice(6, 9).map(Number);
    if (![x, y, z].every(Number.isFinite)) return null;
    return {
      ...common,
      event: LogsReaderEvents.MAP_MARKER_PLACED,
      name: marker[1].trim(),
      teamID: Number(marker[2]),
      ...identity(marker[3]),
      markerTeamID: Number(marker[4]),
      markerType: marker[5],
      x,
      y,
      z,
    };
  }
  const spawned = text.match(
    /^Deployable (.+?) spawned for team (\d+) at location \{([^,]+),\s*([^,]+),\s*([^}]+)\}(?: by player (.+?) \(ID: (\d+), OnlineIDs: (.+?)\))?$/,
  );
  if (!spawned) return null;
  const [x, y, z] = spawned.slice(3, 6).map(Number);
  if (![x, y, z].every(Number.isFinite)) return null;
  return {
    ...common,
    event: LogsReaderEvents.DEPLOYABLE_SPAWNED,
    deployable: spawned[1],
    teamID: Number(spawned[2]),
    x,
    y,
    z,
    name: spawned[6]?.trim() || null,
    playerID: spawned[7] || null,
    ...identity(spawned[8] || ''),
  };
}
