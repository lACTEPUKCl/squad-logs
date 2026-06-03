import { LogsReaderEvents } from '../../events';
import { TRallyPlaced } from '../../types';

export const rallyPlaced = (line: string) => {
  const matches = line.match(
    /\[([0-9.:-]+)]\[([ 0-9]*)].*?SQGameRallyPoint\s+\S+\s+for team (\d+) at X=([\d.-]+) Y=([\d.-]+) Z=([\d.-]+) created/,
  );

  if (matches) {
    const data: TRallyPlaced = {
      raw: matches[0],
      time: matches[1],
      chainID: matches[2],
      teamID: matches[3],
      x: matches[4],
      y: matches[5],
      z: matches[6],
      event: LogsReaderEvents.RALLY_PLACED,
    };

    return data;
  }

  return null;
};
