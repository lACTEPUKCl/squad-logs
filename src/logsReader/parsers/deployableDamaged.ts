import { LogsReaderEvents } from '../../events';
import { TDeployableDamaged } from '../../types';

export const deployableDamaged = (line: string) => {
  const matches = line.match(
    /^\[([0-9.:-]+)]\[([ 0-9]*)]LogSquadTrace: \[DedicatedServer](?:ASQDeployable::)?TakeDamage\(\): ([A-Za-z0-9_]+_C_[0-9]+): ([0-9.]+) damage taken by causer ([A-Za-z0-9_]+_C_[0-9]+) instigator (.+?) \(Online IDs: EOS: ([0-9a-fA-F]+) steam: ([0-9]+)\) health remaining ([0-9.]+)/,
  );

  if (matches) {
    const data: TDeployableDamaged = {
      raw: matches[0],
      time: matches[1],
      chainID: matches[2],
      deployable: matches[3],
      damage: parseFloat(matches[4]),
      weapon: matches[5],
      name: matches[6],
      eosID: matches[7],
      steamID: matches[8],
      healthRemaining: matches[9],
      event: LogsReaderEvents.DEPLOYABLE_DAMAGED,
    };

    return data;
  }

  return null;
};
