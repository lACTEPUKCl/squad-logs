import { LogsReaderEvents } from '../../events';
import { TEacAction } from '../../types';

export const eacAction = (line: string) => {
  const matches = line.match(
    /\[([0-9.:-]+)]\[([ 0-9]*)].*?\[ClientActionRequired]\s*Client:\s*(\S+)\s+Action:\s*(\d+)\s+ActionReason:\s*(\d+)\s+Details:\s*(.+)/,
  );

  if (matches) {
    const data: TEacAction = {
      raw: matches[0],
      time: matches[1],
      chainID: matches[2],
      client: matches[3],
      action: matches[4],
      actionReason: matches[5],
      details: matches[6],
      event: LogsReaderEvents.EAC_ACTION,
    };

    return data;
  }

  return null;
};
