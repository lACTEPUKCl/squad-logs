import EventEmitter from 'events';
import { adminBroadcast } from './adminBroadcast';
import { applyExplosiveDamaged } from './applyExplosiveDamaged';
import { deployableDamaged } from './deployableDamaged';
import { newGame } from './newGame';
import { playerConnected } from './playerConnected';
import { playerDamaged } from './playerDamaged';
import { playerDied } from './playerDied';
import { playerDisconnected } from './playerDisconnected';
import { playerPossess } from './playerPossess';
import { playerRevived } from './playerRevived';
import { playerSuicide } from './playerSuicide';
import { playerUnpossess } from './playerUnpossess';
import { playerWounded } from './playerWounded';
import { roundEnded } from './roundEnded';
import { roundTickets } from './roundTickets';
import { roundWinner } from './roundWinner';
import { squadCreated } from './squadCreated';
import { vehicleDamaged } from './vehicleDamaged';

const parsers = [
  adminBroadcast,
  newGame,
  playerConnected,
  playerDisconnected,
  playerRevived,
  playerWounded,
  playerDied,
  playerPossess,
  playerUnpossess,
  playerDamaged,
  playerSuicide,
  deployableDamaged,
  roundEnded,
  roundTickets,
  roundWinner,
  squadCreated,
  vehicleDamaged,
  applyExplosiveDamaged,
];

export const parseLine = (line: string, emitter: EventEmitter) => {
  parsers.forEach((f) => {
    const result = f(line);

    if (result) {
      emitter.emit(result.event, result);
    }
  });
};
