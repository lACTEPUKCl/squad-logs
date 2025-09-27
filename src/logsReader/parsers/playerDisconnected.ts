import { LogsReaderEvents } from '../../events';
import { TPlayerDisconnected } from '../../types';

export const playerDisconnected = (line: string) => {
  const matches = line.match(
    /^\[([0-9.:-]+)]\[\s*([0-9]*)]LogNet: UChannel::Close: Sending CloseBunch\. ChIndex == \d+\. Name: \[UChannel] ChIndex: \d+, Closing: \d+ \[UNetConnection] RemoteAddr: ([\d.]+):\d+, Name: (?:RedpointEOS|EOS)IpNetConnection_\d+, Driver: .*?(?:RedpointEOS|EOS)NetDriver_\d+.*?, IsServer: YES, PC: ([^\s,]+|NULL), Owner: [^\s,]+, UniqueId: (?:RedpointEOS|EOS):([\dA-Fa-f]+)/,
  );

  if (matches) {
    const data: TPlayerDisconnected = {
      raw: matches[0],
      time: matches[1],
      chainID: matches[2],
      ip: matches[3],
      playerController: matches[4],
      eosID: matches[5],
      event: LogsReaderEvents.PLAYER_DISCONNECTED,
    };

    return data;
  }

  return null;
};
