import { LogsReaderEvents } from '../../events';
import { TPlayerDied } from '../../types';

export const playerDied = (line: string) => {
  const matches = line.match(
    /^\[([0-9.:-]+)]\[\s*([0-9]+)]LogSquadTrace:\s*\[DedicatedServer]\s*(?:ASQSoldier::)?Die\(\):\s*Player:(.+?)\s+KillingDamage=(-?[0-9.]+)\s+from\s+([^\s]+)\s+\(Online IDs:\s+(?:(?:EOS:\s*([A-Fa-f0-9]{32})\s+steam:\s*(\d{17}))|INVALID)\s+\|\s+Contoller ID:\s*([A-Za-z0-9_]+|None)\)\s+caused by\s+(.+)$/,
  );

  if (matches) {
    const data: TPlayerDied = {
      raw: matches[0],
      time: matches[1],
      woundTime: matches[1],
      chainID: matches[2],
      victimName: matches[3],
      damage: parseFloat(matches[4]),
      attackerPlayerController: matches[5],
      attackerEOSID: matches[6],
      attackerSteamID: matches[7],
      weapon: matches[9],
      event: LogsReaderEvents.PLAYER_DIED,
    };

    return data;
  }

  return null;
};
