import { LogsReaderEvents } from '../../events';
import { TMatchResult } from '../../types';

export const matchResult = (line: string) => {
  const matches = line.match(
    /\[([0-9.:-]+)]\[([ 0-9]*)].*?Team\s+(\d+),\s*(.+?)\s+\(\s*(.+?)\s*\)\s+has\s+(won|lost)\s+the match with\s+(\d+)\s+Tickets on layer\s+(.+?)\s+\(level\s+(.+?)\)/,
  );

  if (matches) {
    const data: TMatchResult = {
      raw: matches[0],
      time: matches[1],
      chainID: matches[2],
      teamID: matches[3],
      faction: matches[4],
      subfaction: matches[5],
      result: matches[6] as 'won' | 'lost',
      tickets: matches[7],
      layer: matches[8],
      level: matches[9],
      event: LogsReaderEvents.MATCH_RESULT,
    };

    return data;
  }

  return null;
};
