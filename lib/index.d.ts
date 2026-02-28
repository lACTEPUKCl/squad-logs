/// <reference types="node" />
import EventEmitter from 'events';
import SFTPClient from 'ssh2-sftp-client';
import { Tail } from 'tail';

declare const LogsReaderEvents: {
    ADMIN_BROADCAST: string;
    DEPLOYABLE_DAMAGED: string;
    GRENADE_SPAWNED: string;
    EXPLOSIVE_DAMAGED: string;
    NEW_GAME: string;
    PLAYER_CONNECTED: string;
    PLAYER_ACCEPTING_CONNECTION: string;
    PLAYER_DISCONNECTED: string;
    PLAYER_DAMAGED: string;
    PLAYER_DIED: string;
    PLAYER_POSSESS: string;
    PLAYER_UNPOSSESS: string;
    PLAYER_REVIVED: string;
    PLAYER_SUICIDE: string;
    PLAYER_WOUNDED: string;
    ROUND_ENDED: string;
    ROUND_TICKETS: string;
    ROUND_WINNER: string;
    SQUAD_CREATED: string;
    VEHICLE_DAMAGED: string;
    TICK_RATE: string;
    ROUND_SUMMARY: string;
};

declare const initLogger: (id: number, enabled: boolean) => {
    log: (...text: string[]) => void;
    warn: (...text: string[]) => void;
    error: (...text: string[]) => void;
};

type TLogReaderOptions = {
    id: number;
    filePath: string;
    adminsFilePath: string;
    autoReconnect: boolean;
    readType: 'local' | 'remote';
    host?: string;
    username?: string;
    password?: string;
    timeout?: number;
    logEnabled?: boolean;
};
type TAdminBroadcast = {
    raw: string;
    time: string;
    chainID: string;
    message: string;
    from: string;
    event: string;
};
type TNewGame = {
    raw: string;
    time: string;
    chainID: string;
    dlc: string;
    mapClassname: string;
    layerClassname: string;
    event: string;
};
type TPlayerConnected = {
    raw: string;
    time: string;
    chainID: string;
    playerController: string;
    ip: string;
    eosID: string;
    steamID: string;
    event: string;
};
type TPlayerDied = {
    raw: string;
    time: string;
    woundTime: string;
    chainID: string;
    victimName: string;
    damage: number;
    attackerPlayerController: string;
    attackerEOSID: string;
    attackerSteamID: string;
    /** Weapon: nullptr or controller */
    weapon: string;
    event: string;
};
type TPlayerDisconnected = {
    raw: string;
    time: string;
    chainID: string;
    ip: string;
    eosID: string;
    playerController: string;
    event: string;
};
type TPlayerPossess = {
    raw: string;
    time: string;
    chainID: string;
    name: string;
    eosID: string;
    steamID: string;
    possessClassname: string;
    pawn: string;
    event: string;
};
type TPlayerRevived = {
    raw: string;
    time: string;
    chainID: string;
    reviverName: string;
    reviverEOSID: string;
    reviverSteamID: string;
    victimName: string;
    victimEOSID: string;
    victimSteamID: string;
    event: string;
};
type TPlayerUnpossess = {
    raw: string;
    time: string;
    chainID: string;
    name: string;
    eosID: string;
    steamID: string;
    event: string;
};
type TPlayerWounded = {
    raw: string;
    time: string;
    chainID: string;
    victimName: string;
    damage: number;
    attackerPlayerController: string;
    attackerEOSID: string;
    attackerSteamID: string;
    weapon: string;
    event: string;
};
type TDeployableDamaged = {
    raw: string;
    time: string;
    chainID: string;
    deployable: string;
    damage: number;
    weapon: string;
    name: string;
    eosID: string;
    steamID: string;
    healthRemaining: string;
    event: string;
};
type TGrenadeSpawned = {
    raw: string;
    time: string;
    chainID: string;
    instigator: string;
    event: string;
};
type TApplyExplosiveDamage = {
    raw: string;
    time: string;
    chainID: string;
    name: string;
    deployable: string;
    playerController: string;
    locations: string;
    event: string;
};
type TPlayerDamaged = {
    raw: string;
    time: string;
    chainID: string;
    victimName: string;
    damage: number;
    attackerName: string;
    attackerEOSID: string;
    attackerSteamID: string;
    attackerController: string;
    weapon: string;
    event: string;
};
type TPlayerSuicide = {
    raw: string;
    time: string;
    chainID: string;
    name: string;
    event: string;
};
type TRoundEnded = {
    raw: string;
    time: string;
    chainID: string;
    event: string;
};
type TRoundTickets = {
    raw: string;
    time: string;
    chainID: string;
    team: string;
    subfaction: string;
    faction: string;
    action: string;
    tickets: string;
    layer: string;
    level: string;
    event: string;
};
type TRoundWinner = {
    raw: string;
    time: string;
    chainID: string;
    winner: string;
    layer: string;
    event: string;
};
type TSquadCreated = {
    raw: string;
    time: string;
    chainID: string;
    name: string;
    eosID: string;
    steamID: string;
    squadID: string;
    squadName: string;
    teamName: string;
    event: string;
};
type TVehicleDamaged = {
    raw: string;
    time: string;
    chainID: string;
    victimVehicle: string;
    damage: number;
    attackerVehicle: string;
    attackerName: string;
    attackerEOSID: string;
    attackerSteamID: string;
    healthRemaining: string;
    event: string;
};
type TTickRate = {
    raw: string;
    time: string;
    chainID: string;
    tickRate: number;
    event: string;
};
type TNotifyAcceptingConnection = {
    raw: string;
    time: string;
    chainID: string;
    ip: string;
    port: string;
    event: string;
};
type TPlayfabRoundSummary = {
    raw: string;
    time: string;
    chainID: string;
    event: string;
    sessionId: string;
    map: string;
    layer: string;
    gameMode: string;
    durationSec: number;
    winFaction: string;
    winTeamIndex: number;
    winTickets: number;
    winPlayerCount: number;
    loseFaction: string;
    loseTickets: number;
    losePlayerCount: number;
    licensed: boolean;
    detailsTeam1?: Record<string, number>;
    detailsTeam2?: Record<string, number>;
    modsList: string[];
};

declare class LogsReader extends EventEmitter {
    #private;
    id: number;
    filePath: string;
    adminsFilePath: string;
    readType: 'local' | 'remote';
    autoReconnect: boolean;
    logger: ReturnType<typeof initLogger>;
    sftpConnected: boolean;
    sftp?: SFTPClient;
    tail?: Tail;
    host?: string;
    username?: string;
    password?: string;
    logEnabled?: boolean;
    timeout?: number;
    constructor(options: TLogReaderOptions);
    init(): Promise<unknown>;
    getAdminsFile(): Promise<{
        [x: string]: {
            [x: string]: true;
        };
    }>;
    close(): Promise<void>;
}

export { LogsReader, LogsReaderEvents, type TAdminBroadcast, type TApplyExplosiveDamage, type TDeployableDamaged, type TGrenadeSpawned, type TLogReaderOptions, type TNewGame, type TNotifyAcceptingConnection, type TPlayerConnected, type TPlayerDamaged, type TPlayerDied, type TPlayerDisconnected, type TPlayerPossess, type TPlayerRevived, type TPlayerSuicide, type TPlayerUnpossess, type TPlayerWounded, type TPlayfabRoundSummary, type TRoundEnded, type TRoundTickets, type TRoundWinner, type TSquadCreated, type TTickRate, type TVehicleDamaged };
