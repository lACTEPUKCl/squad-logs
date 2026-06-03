import { LogsReaderEvents } from '../../events';
import { TAdminAction } from '../../types';

const PREFIX = /\[([0-9.:-]+)]\[([ 0-9]*)].*?/;
const re = (body: RegExp) => new RegExp(PREFIX.source + body.source);

const KICK = re(
  /ADMIN COMMAND:\s*Kicked player\s+\d+\.\s*\[Online IDs=\s*EOS:\s*(\w+)\s+steam:\s*(\d+)]\s*(.+?)\s+from\s+RCON/,
);
const TEAMCHANGE = re(
  /ADMIN COMMAND:\s*Forced team change for player\s+\d+\.\s*\[Online IDs=\s*EOS:\s*(\w+)\s+steam:\s*(\d+)]\s*(.+?)\s+from\s+RCON/,
);
const DISBAND = re(
  /ADMIN COMMAND:\s*Remote admin disbanded squad\s+(\d+)\s+on team\s+(\d+),\s*named "(.+?)"/,
);
const AUTO_BAN = /\[([0-9.:-]+)]\[([ 0-9]*)].*?Banning player:\s*(.+?)\s*;\s*Reason\s*=\s*(.+)/;
const WARN = re(
  /ADMIN COMMAND:\s*Remote admin has warned player\s+(.+?)\.\s*Message was "(.+?)"\s*from/,
);

export const adminAction = (line: string) => {
  let m = line.match(KICK);
  if (m) {
    return {
      raw: m[0], time: m[1], chainID: m[2], action: 'kick',
      eosID: m[3], steamID: m[4], name: m[5],
      event: LogsReaderEvents.ADMIN_ACTION,
    } as TAdminAction;
  }

  m = line.match(TEAMCHANGE);
  if (m) {
    return {
      raw: m[0], time: m[1], chainID: m[2], action: 'forceTeamChange',
      eosID: m[3], steamID: m[4], name: m[5],
      event: LogsReaderEvents.ADMIN_ACTION,
    } as TAdminAction;
  }

  m = line.match(DISBAND);
  if (m) {
    return {
      raw: m[0], time: m[1], chainID: m[2], action: 'disband',
      squadID: m[3], teamID: m[4], squadName: m[5],
      event: LogsReaderEvents.ADMIN_ACTION,
    } as TAdminAction;
  }

  m = line.match(WARN);
  if (m) {
    return {
      raw: m[0], time: m[1], chainID: m[2], action: 'warn',
      name: m[3], message: m[4],
      event: LogsReaderEvents.ADMIN_ACTION,
    } as TAdminAction;
  }

  m = line.match(AUTO_BAN);
  if (m) {
    return {
      raw: m[0], time: m[1], chainID: m[2], action: 'autoBan',
      name: m[3], reason: m[4],
      event: LogsReaderEvents.ADMIN_ACTION,
    } as TAdminAction;
  }

  return null;
};
