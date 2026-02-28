import { LogsReaderEvents } from '../../events';
import { TPlayerDisconnected } from '../../types';

export const playerDisconnected = (line: string) => {
  const matches = line.match(
    /^\[([0-9.:-]+)]\[([ 0-9]*)]LogNet: UChannel::Close: Sending CloseBunch\. ChIndex == [0-9]+\. Name: \[UChannel\] ChIndex: [0-9]+, Closing: [0-9]+ \[UNetConnection\] RemoteAddr: ([\d.]+):[\d]+, Name: [A-Za-z0-9_]+_[0-9]+, Driver: .*?, IsServer: YES, PC: ([^\s]+), Owner: [^\s]+, UniqueId: RedpointEOS:([0-9a-fA-F]+)$/,
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
