import { LogsReaderEvents } from '../../events';
import { TGrenadeSpawned } from '../../types';

export const grenadeSpawned = (line: string) => {
  const matches = line.match(
    /^\[([0-9.:-]+)]\[([ 0-9]*)]LogSquadTrace: \[DedicatedServer](?:ASQVehicleSeat::)?ServerSpawnGrenade_Implementation\(\): Grenade Spawned: Instigator=(.+) SpawnLocation=V\((X=[^)]*)\)/,
  );

  if (matches) {
    const data: TGrenadeSpawned = {
      raw: matches[0],
      time: matches[1],
      chainID: matches[2],
      instigator: matches[3],
      event: LogsReaderEvents.GRENADE_SPAWNED,
    };

    return data;
  }

  return null;
};
