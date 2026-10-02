import EventEmitter from 'events';
import { adminAction } from './adminAction';
import { adminBroadcast } from './adminBroadcast';
import { applyExplosiveDamage } from './applyExplosiveDamage';
import { deployableDamaged } from './deployableDamaged';
import { eacAction } from './eacAction';
import { fobPlaced } from './fobPlaced';
import { fobRadioCapture } from './fobRadio';
import { grenadeSpawned } from './grenadeSpawned';
import { matchResult } from './matchResult';
import { newGame } from './newGame';
import { nextLayer } from './nextLayer';
import { notifyAcceptingConnection } from './NotifyAcceptingConnection';
import { playerConnected } from './playerConnected';
import { playerDamaged } from './playerDamaged';
import { playerDied } from './playerDied';
import { playerDisconnected } from './playerDisconnected';
import { playerPossess } from './playerPossess';
import { playerRespawn } from './playerRespawn';
import { playerRevived } from './playerRevived';
import { playerStateChanged } from './playerStateChanged';
import { playerSuicide } from './playerSuicide';
import { playerUnpossess } from './playerUnpossess';
import { playerWounded } from './playerWounded';
import { rallyPlaced } from './rallyPlaced';
import { roundEnded } from './roundEnded';
import { playfabRoundSummary } from './roundSummary';
import { roundTickets } from './roundTickets';
import { roundWinner } from './roundWinner';
import { serverTickRate } from './serverTickRate';
import { squadCreated } from './squadCreated';
import { vehicleDamaged } from './vehicleDamaged';
import { vehicleSeat } from './vehicleSeat';
import { worldActivity } from './worldActivity';

const parsers = [
  worldActivity,
  fobRadioCapture,
  vehicleSeat,
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
  serverTickRate,
  applyExplosiveDamage,
  notifyAcceptingConnection,
  playfabRoundSummary,
  grenadeSpawned,
  fobPlaced,
  rallyPlaced,
  playerRespawn,
  eacAction,
  playerStateChanged,
  matchResult,
  nextLayer,
  adminAction,
];

export const parseLine = (line: string, emitter: EventEmitter) => {
  for (let i = 0; i < parsers.length; i++) {
    const result = parsers[i](line);

    if (result) {
      emitter.emit(result.event, result);

      break;
    }
  }
};
