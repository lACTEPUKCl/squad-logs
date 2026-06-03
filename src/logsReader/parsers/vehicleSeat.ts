import { LogsReaderEvents } from '../../events';
import { TVehicleSeatChange } from '../../types';

// Вход в технику (с номером сиденья)
const ENTER =
  /\[([0-9.:-]+)]\[([ 0-9]*)].*?OnPossess\(\):\s*PC=(.+?)\s+\(Online IDs:\s*EOS:\s*(\w+)\s+steam:\s*(\d+)\)\s*Entered Vehicle\s+Pawn=.+?\s+\(Asset Name\s*=\s*([^)]+)\).*?Seat Number=(\d+)/;
// Выход из техники (с номером сиденья)
const EXIT =
  /\[([0-9.:-]+)]\[([ 0-9]*)].*?OnUnPossess\(\):\s*PC=(.+?)\s+\(Online IDs:\s*EOS:\s*(\w+)\s+steam:\s*(\d+)\)\s*Exited Vehicle\s+Pawn=.+?\s+\(Asset Name\s*=\s*([^)]+)\).*?Seat Number=(\d+)/;

export const vehicleSeat = (line: string) => {
  let matches = line.match(ENTER);
  let action: 'enter' | 'exit' = 'enter';

  if (!matches) {
    matches = line.match(EXIT);
    action = 'exit';
  }

  if (matches) {
    const data: TVehicleSeatChange = {
      raw: matches[0],
      time: matches[1],
      chainID: matches[2],
      action,
      name: matches[3],
      eosID: matches[4],
      steamID: matches[5],
      vehicle: matches[6].trim(),
      seatNumber: matches[7],
      event: LogsReaderEvents.VEHICLE_SEAT_CHANGE,
    };

    return data;
  }

  return null;
};
