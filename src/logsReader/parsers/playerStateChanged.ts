import { LogsReaderEvents } from '../../events';
import { TPlayerStateChanged } from '../../types';

export const playerStateChanged = (line: string) => {
  const matches = line.match(
    /\[([0-9.:-]+)]\[([ 0-9]*)].*?ChangeState\(\):\s*PC=(.+?)\s+\(Online IDs:\s*EOS:\s*(\w+)\s+steam:\s*(\d+)\)\s+OldState=(\w+)\s+NewState=(\w+)/,
  );

  if (matches) {
    const data: TPlayerStateChanged = {
      raw: matches[0],
      time: matches[1],
      chainID: matches[2],
      name: matches[3],
      eosID: matches[4],
      steamID: matches[5],
      oldState: matches[6],
      newState: matches[7],
      event: LogsReaderEvents.PLAYER_STATE_CHANGED,
    };

    return data;
  }

  return null;
};
