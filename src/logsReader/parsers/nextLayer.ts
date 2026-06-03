import { LogsReaderEvents } from '../../events';
import { TNextLayerSet } from '../../types';

// "Set next layer to <layer> <F1>+<S1> <F2>+<S2>"
const SET =
  /\[([0-9.:-]+)]\[([ 0-9]*)].*?ADMIN COMMAND:\s*Set next layer to\s+(\S+)\s+(\w+)\+(\w+)\s+(\w+)\+(\w+)/;
// "Change layer to <layer> <F1> <F2>"
const CHANGE =
  /\[([0-9.:-]+)]\[([ 0-9]*)].*?ADMIN COMMAND:\s*Change layer to\s+(\S+)\s+(\w+)\s+(\w+)/;

export const nextLayer = (line: string) => {
  let m = line.match(SET);
  if (m) {
    const data: TNextLayerSet = {
      raw: m[0],
      time: m[1],
      chainID: m[2],
      action: 'set',
      layer: m[3],
      team1Faction: m[4],
      team1Subfaction: m[5],
      team2Faction: m[6],
      team2Subfaction: m[7],
      event: LogsReaderEvents.NEXT_LAYER_SET,
    };
    return data;
  }

  m = line.match(CHANGE);
  if (m) {
    const data: TNextLayerSet = {
      raw: m[0],
      time: m[1],
      chainID: m[2],
      action: 'change',
      layer: m[3],
      team1Faction: m[4],
      team2Faction: m[5],
      event: LogsReaderEvents.NEXT_LAYER_SET,
    };
    return data;
  }

  return null;
};
