import { LogsReaderEvents } from '../../events';
import { TFobPlaced } from '../../types';
import { takeFobRadio } from './fobRadio';

export const fobPlaced = (line: string) => {
  const matches = line.match(
    /\[([0-9.:-]+)]\[([ 0-9]*)].*?SQForwardBase for team (\d+) created at X=([\d.-]+) Y=([\d.-]+) Z=([\d.-]+)/,
  );

  if (matches) {
    const radioId = takeFobRadio(matches[2]);
    const data: TFobPlaced = {
      raw: matches[0],
      time: matches[1],
      chainID: matches[2],
      teamID: matches[3],
      x: matches[4],
      y: matches[5],
      z: matches[6],
      radioId: radioId ?? undefined,
      isMain: !radioId,
      event: LogsReaderEvents.FOB_PLACED,
    };

    return data;
  }

  return null;
};
