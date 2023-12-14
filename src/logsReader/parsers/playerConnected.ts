export type TPlayerConnected = {
  raw: string;
  time: string;
  chainID: string;
  ip: string;
  eosID: string;
  steamID: string;
  event: string;
};

export const playerConnected = (line: string) => {
  const matches = line.match(
    /^\[([0-9.:-]+)]\[([ 0-9]*)]LogSquad: PostLogin: NewPlayer: BP_PlayerController_C .+PersistentLevel\.([^\s]+) \(IP: ([\d.]+) \| Online IDs: EOS: ([0-9a-f]{32}) steam: (\d+)\)/,
  );

  if (matches) {
    const data: TPlayerConnected = {
      raw: matches[0],
      time: matches[1],
      chainID: matches[2],
      ip: matches[4],
      eosID: matches[5],
      steamID: matches[6],
      event: 'PLAYER_CONNECTED',
    };

    return data;
  }

  return null;
};
