import { LogsReaderEvents } from '../../events';
import { TPlayerRespawn } from '../../types';

export const playerRespawn = (line: string) => {
  const matches = line.match(
    /\[([0-9.:-]+)]\[([ 0-9]*)].*?RestartPlayer\(\):\s*On Server PC=(.+?)\s+Spawn=(\S+)\s+DeployRole=(\S+)/,
  );

  if (matches) {
    const data: TPlayerRespawn = {
      raw: matches[0],
      time: matches[1],
      chainID: matches[2],
      playerController: matches[3],
      spawn: matches[4],
      role: matches[5],
      event: LogsReaderEvents.PLAYER_RESPAWN,
    };

    return data;
  }

  return null;
};
