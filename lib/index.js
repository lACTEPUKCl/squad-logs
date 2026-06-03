import EventEmitter from 'events';
import fs from 'fs';
import readline from 'readline';
import SFTPClient from 'ssh2-sftp-client';
import { Tail } from 'tail';
import chalk from 'chalk';
import { format } from 'date-fns';

const LogsReaderEvents = {
    ADMIN_BROADCAST: 'ADMIN_BROADCAST',
    DEPLOYABLE_DAMAGED: 'DEPLOYABLE_DAMAGED',
    GRENADE_SPAWNED: 'GRENADE_SPAWNED',
    EXPLOSIVE_DAMAGED: 'EXPLOSIVE_DAMAGED',
    NEW_GAME: 'NEW_GAME',
    PLAYER_CONNECTED: 'PLAYER_CONNECTED',
    PLAYER_ACCEPTING_CONNECTION: 'PLAYER_ACCEPTING_CONNECTION',
    PLAYER_DISCONNECTED: 'PLAYER_DISCONNECTED',
    PLAYER_DAMAGED: 'PLAYER_DAMAGED',
    PLAYER_DIED: 'PLAYER_DIED',
    PLAYER_POSSESS: 'PLAYER_POSSESS',
    PLAYER_UNPOSSESS: 'PLAYER_UNPOSSESS',
    PLAYER_REVIVED: 'PLAYER_REVIVED',
    PLAYER_SUICIDE: 'PLAYER_SUICIDE',
    PLAYER_WOUNDED: 'PLAYER_WOUNDED',
    ROUND_ENDED: 'ROUND_ENDED',
    ROUND_TICKETS: 'ROUND_TICKETS',
    ROUND_WINNER: 'ROUND_WINNER',
    SQUAD_CREATED: 'SQUAD_CREATED',
    VEHICLE_DAMAGED: 'VEHICLE_DAMAGED',
    TICK_RATE: 'TICK_RATE',
    ROUND_SUMMARY: 'ROUND_SUMMARY',
    FOB_PLACED: 'FOB_PLACED',
    RALLY_PLACED: 'RALLY_PLACED',
    PLAYER_RESPAWN: 'PLAYER_RESPAWN',
    VEHICLE_SEAT_CHANGE: 'VEHICLE_SEAT_CHANGE',
    EAC_ACTION: 'EAC_ACTION',
    PLAYER_STATE_CHANGED: 'PLAYER_STATE_CHANGED',
    MATCH_RESULT: 'MATCH_RESULT',
    NEXT_LAYER_SET: 'NEXT_LAYER_SET',
    ADMIN_ACTION: 'ADMIN_ACTION'
};

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function __classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}

function __classPrivateFieldSet(receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

const getTime = () => format(new Date(), 'd LLL HH:mm:ss');
const initLogger = (id, enabled) => ({
    log: (...text) => {
        enabled &&
            console.log(chalk.yellow(`[SquadLogs][${id}][${getTime()}]`), chalk.green(text));
    },
    warn: (...text) => {
        enabled &&
            console.log(chalk.yellow(`[SquadLogs][${id}][${getTime()}]`), chalk.magenta(text));
    },
    error: (...text) => {
        enabled &&
            console.log(chalk.yellow(`[SquadLogs][${id}][${getTime()}]`), chalk.red(text));
    },
});

const adminBroadcast = (line) => {
    const matches = line.match(/\[([0-9.:-]+)]\[([ 0-9]*)]LogSquad: ADMIN COMMAND: Message broadcasted <(.+)> from (.+)/);
    if (matches) {
        const data = {
            raw: matches[0],
            time: matches[1],
            chainID: matches[2],
            message: matches[3],
            from: matches[4],
            event: LogsReaderEvents.ADMIN_BROADCAST,
        };
        return data;
    }
    return null;
};

const deployableDamaged = (line) => {
    const matches = line.match(/\[([0-9.:-]+)]\[([ 0-9]*)]LogSquadTrace: \[DedicatedServer](?:ASQDeployable::)?TakeDamage\(\): ([A-Za-z0-9_]+_C_[0-9]+): ([0-9.]+) damage taken by causer ([A-Za-z0-9_]+_C_[0-9]+) instigator (.+?) \(Online IDs: EOS: ([0-9a-fA-F]+) steam: ([0-9]+)\) health remaining ([0-9.]+)/);
    if (matches) {
        const data = {
            raw: matches[0],
            time: matches[1],
            chainID: matches[2],
            deployable: matches[3],
            damage: parseFloat(matches[4]),
            weapon: matches[5],
            name: matches[6],
            eosID: matches[7],
            steamID: matches[8],
            healthRemaining: matches[9],
            event: LogsReaderEvents.DEPLOYABLE_DAMAGED,
        };
        return data;
    }
    return null;
};

const newGame = (line) => {
    const matches = line.match(/\[([0-9.:-]+)]\[([ 0-9]*)]LogWorld: Bringing World \/([A-z]+)\/(?:Maps\/)?([A-z0-9-]+)\/(?:.+\/)?([A-z0-9-]+)(?:\.[A-z0-9-]+)/);
    if (matches) {
        const data = {
            raw: matches[0],
            time: matches[1],
            chainID: matches[2],
            dlc: matches[3],
            mapClassname: matches[4],
            layerClassname: matches[5],
            event: LogsReaderEvents.NEW_GAME,
        };
        if (data.layerClassname.includes('Transition'))
            return null;
        return data;
    }
    return null;
};

const playerConnected = (line) => {
    const matches = line.match(/\[([0-9.:-]+)]\[([ 0-9]*)]LogSquad: PostLogin: NewPlayer: [^\s]+ .+PersistentLevel\.([^\s]+) \(IP: ([\d.]+) \| Online IDs: EOS: ([0-9a-f]{32}) steam: (\d+)\)/);
    if (matches) {
        const data = {
            raw: matches[0],
            time: matches[1],
            chainID: matches[2],
            playerController: matches[3],
            ip: matches[4],
            eosID: matches[5],
            steamID: matches[6],
            event: LogsReaderEvents.PLAYER_CONNECTED,
        };
        return data;
    }
    return null;
};

const playerDamaged = (line) => {
    const matches = line.match(/\[([0-9.:-]+)]\[([ 0-9]*)]LogSquad: Player: (.+) ActualDamage=([0-9.]+) from (.+) \(Online IDs: EOS: ([0-9a-f]{32}) steam: (\d{17}) \| Player Controller ID: ([^ ]+)\)caused by ([A-z_0-9-]+)_C/);
    if (matches) {
        const data = {
            raw: matches[0],
            time: matches[1],
            chainID: matches[2],
            victimName: matches[3],
            damage: parseFloat(matches[4]),
            attackerName: matches[5],
            attackerEOSID: matches[6],
            attackerSteamID: matches[7],
            attackerController: matches[8],
            weapon: matches[9],
            event: LogsReaderEvents.PLAYER_DAMAGED,
        };
        return data;
    }
    return null;
};

const playerDied = (line) => {
    const matches = line.match(/\[([0-9.:-]+)]\[\s*([0-9]+)]LogSquadTrace:\s*\[DedicatedServer]\s*(?:ASQSoldier::)?Die\(\):\s*Player:(.+?)\s+KillingDamage=(-?[0-9.]+)\s+from\s+([^\s]+)\s+\(Online IDs:\s+(?:(?:EOS:\s*([A-Fa-f0-9]{32})\s+steam:\s*(\d{17}))|INVALID)\s+\|\s+Contoller ID:\s*([A-Za-z0-9_]+|None)\)\s+caused by\s+(.+)$/);
    if (matches) {
        const data = {
            raw: matches[0],
            time: matches[1],
            woundTime: matches[1],
            chainID: matches[2],
            victimName: matches[3],
            damage: parseFloat(matches[4]),
            attackerPlayerController: matches[5],
            attackerEOSID: matches[6],
            attackerSteamID: matches[7],
            weapon: matches[9],
            event: LogsReaderEvents.PLAYER_DIED,
        };
        return data;
    }
    return null;
};

const playerDisconnected = (line) => {
    const matches = line.match(/\[([0-9.:-]+)]\[([ 0-9]*)]LogNet: UChannel::Close: Sending CloseBunch\. ChIndex == [0-9]+\. Name: \[UChannel\] ChIndex: [0-9]+, Closing: [0-9]+ \[UNetConnection\] RemoteAddr: ([\d.]+):[\d]+, Name: [A-Za-z0-9_]+_[0-9]+, Driver: .*?, IsServer: YES, PC: ([^\s]+), Owner: [^\s]+, UniqueId: RedpointEOS:([0-9a-fA-F]+)$/);
    if (matches) {
        const data = {
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

const playerPossess = (line) => {
    const matches = line.match(/\[([0-9.:-]+)]\[([ 0-9]*)]LogSquadTrace: \[DedicatedServer](?:ASQPlayerController::)?OnPossess\(\): PC=(.+) \(Online IDs: EOS: ([\w\d]{32}) steam: (\d{17})\) Pawn=([A-z0-9_]+_C_[0-9]*)/);
    if (matches) {
        const data = {
            raw: matches[0],
            time: matches[1],
            chainID: matches[2],
            name: matches[3],
            eosID: matches[4],
            steamID: matches[5],
            possessClassname: matches[6],
            pawn: matches[5],
            event: LogsReaderEvents.PLAYER_POSSESS,
        };
        return data;
    }
    return null;
};

const playerRevived = (line) => {
    const matches = line.match(/\[([0-9.:-]+)]\[([ 0-9]*)]LogSquad: (.+) \(Online IDs: EOS: ([0-9a-f]{32}) steam: (\d{17})\) has revived (.+) \(Online IDs: EOS: ([0-9a-f]{32}) steam: (\d{17})\)\./);
    if (matches) {
        const data = {
            raw: matches[0],
            time: matches[1],
            chainID: matches[2],
            reviverName: matches[3],
            reviverEOSID: matches[4],
            reviverSteamID: matches[5],
            victimName: matches[6],
            victimEOSID: matches[7],
            victimSteamID: matches[8],
            event: LogsReaderEvents.PLAYER_REVIVED,
        };
        return data;
    }
    return null;
};

const playerSuicide = (line) => {
    const matches = line.match(/\[([0-9.:-]+)]\[([ 0-9]*)]LogSquad: Warning: Suicide (.+)/);
    if (matches) {
        const data = {
            raw: matches[0],
            time: matches[1],
            chainID: matches[2],
            name: matches[3],
            event: LogsReaderEvents.PLAYER_SUICIDE,
        };
        return data;
    }
    return null;
};

const playerUnpossess = (line) => {
    const matches = line.match(/\[([0-9.:-]+)]\[([ 0-9]*)]LogSquadTrace: \[DedicatedServer](?:ASQPlayerController::)?OnUnPossess\(\): PC=(.+) \(Online IDs: EOS: ([\w\d]{32}) steam: (\d{17})\)/);
    if (matches) {
        const data = {
            raw: matches[0],
            time: matches[1],
            chainID: matches[2],
            name: matches[3],
            eosID: matches[4],
            steamID: matches[5],
            event: LogsReaderEvents.PLAYER_UNPOSSESS,
        };
        return data;
    }
    return null;
};

const playerWounded = (line) => {
    const matches = line.match(/\[([0-9.:-]+)]\[([ 0-9]*)]LogSquadTrace: \[DedicatedServer](?:ASQSoldier::)?Wound\(\): Player:(.+) KillingDamage=(?:-)*([0-9.]+) from ([A-z_0-9]+) \(Online IDs: EOS: ([\w\d]{32}) steam: (\d{17}) \| Controller ID: ([\w\d]+)\) caused by ([A-z_0-9-]+)_C/);
    if (matches) {
        const data = {
            raw: matches[0],
            time: matches[1],
            chainID: matches[2],
            victimName: matches[3],
            damage: parseFloat(matches[4]),
            attackerPlayerController: matches[5],
            attackerEOSID: matches[6],
            attackerSteamID: matches[7],
            weapon: matches[9],
            event: LogsReaderEvents.PLAYER_WOUNDED,
        };
        return data;
    }
    return null;
};

const roundEnded = (line) => {
    const matches = line.match(/\[([0-9.:-]+)]\[([ 0-9]*)]LogGameState: Match State Changed from InProgress to WaitingPostMatch/);
    if (matches) {
        const data = {
            raw: matches[0],
            time: matches[1],
            chainID: matches[2],
            event: LogsReaderEvents.ROUND_ENDED,
        };
        return data;
    }
    return null;
};

const roundTickets = (line) => {
    const matches = line.match(/\[([0-9.:-]+)]\[([ 0-9]*)]LogSquadGameEvents: Display: Team ([0-9]), (.*) \( ?(.*?) ?\) has (won|lost) the match with ([0-9]+) Tickets on layer (.*) \(level (.*)\)!/);
    if (matches) {
        const data = {
            raw: matches[0],
            time: matches[1],
            chainID: matches[2],
            team: matches[3],
            subfaction: matches[4],
            faction: matches[5],
            action: matches[6],
            tickets: matches[7],
            layer: matches[8],
            level: matches[9],
            event: LogsReaderEvents.ROUND_TICKETS,
        };
        return data;
    }
    return null;
};

const roundWinner = (line) => {
    const matches = line.match(/\[([0-9.:-]+)]\[([ 0-9]*)]LogSquadTrace: \[DedicatedServer](?:ASQGameMode::)?DetermineMatchWinner\(\): (.+) won on (.+)/);
    if (matches) {
        const data = {
            raw: matches[0],
            time: matches[1],
            chainID: matches[2],
            winner: matches[3],
            layer: matches[4],
            event: LogsReaderEvents.ROUND_WINNER,
        };
        return data;
    }
    return null;
};

const serverTickRate = (line) => {
    const matches = line.match(/\[([0-9.:-]+)]\[([ 0-9]*)]LogSquad: USQGameState: Server Tick Rate: ([0-9.]+)/);
    if (matches) {
        const data = {
            raw: matches[0],
            time: matches[1],
            chainID: matches[2],
            tickRate: parseFloat(matches[3]),
            event: LogsReaderEvents.TICK_RATE,
        };
        return data;
    }
    return null;
};

const squadCreated = (line) => {
    const matches = line.match(/\[([0-9.:-]+)]\[([ 0-9]*)]LogSquad: (.+) \(Online IDs: EOS: ([0-9a-f]{32}) steam: (\d{17})\) has created Squad (\d+) \(Squad Name: (.+)\) on (.+)/);
    if (matches) {
        const data = {
            raw: matches[0],
            time: matches[1],
            chainID: matches[2],
            name: matches[3],
            eosID: matches[4],
            steamID: matches[5],
            squadID: matches[6],
            squadName: matches[7],
            teamName: matches[8],
            event: LogsReaderEvents.SQUAD_CREATED,
        };
        return data;
    }
    return null;
};

const vehicleDamaged = (line) => {
    const matches = line.match(/\[([0-9.:-]+)]\[([ 0-9]*)]LogSquadTrace: \[DedicatedServer](?:ASQVehicleSeat::)?TraceAndMessageClient\(\): (.+): (.+) damage taken by causer (.+) instigator \(Online Ids: (.+?)\) EOS: ([0-9a-f]{32}) steam: (\d{17}) health remaining (.+)/);
    if (matches) {
        const data = {
            raw: matches[0],
            time: matches[1],
            chainID: matches[2],
            victimVehicle: matches[3],
            damage: parseFloat(matches[4]),
            attackerVehicle: matches[5],
            attackerName: matches[6],
            attackerEOSID: matches[7],
            attackerSteamID: matches[8],
            healthRemaining: matches[9],
            event: LogsReaderEvents.VEHICLE_DAMAGED,
        };
        return data;
    }
    return null;
};

const applyExplosiveDamage = (line) => {
    const matches = line.match(/\[([0-9.:-]+)]\[([ 0-9]*)]LogSquadTrace: \[DedicatedServer](?:ASQProjectile::)?ApplyExplosiveDamage\(\): HitActor=(\S+) DamageCauser=(\S+) DamageInstigator=(\S+) ExplosionLocation=V\((X=[\d\-.]+, Y=[\d\-.]+, Z=[\d\-.]+)\)/);
    if (matches) {
        const data = {
            raw: matches[0],
            time: matches[1],
            chainID: matches[2],
            name: matches[3],
            deployable: matches[4],
            playerController: matches[5],
            locations: matches[6],
            event: LogsReaderEvents.EXPLOSIVE_DAMAGED,
        };
        return data;
    }
    return null;
};

const notifyAcceptingConnection = (line) => {
    const matches = line.match(/\[([0-9.:-]+)]\[([ 0-9]*)]LogNet: NotifyAcceptingConnection accepted from: (\d{1,3}(?:\.\d{1,3}){3}):(\d+)$/);
    if (matches) {
        const data = {
            raw: matches[0],
            time: matches[1],
            chainID: matches[2],
            ip: matches[3],
            port: matches[4],
            event: LogsReaderEvents.PLAYER_ACCEPTING_CONNECTION,
        };
        return data;
    }
    return null;
};

// parsers/playfabRoundSummary.ts
const playfabRoundSummary = (() => {
    let collecting = false;
    let time = '';
    let chainID = '';
    let firstLine = '';
    let buf = [];
    let depth = 0;
    let inString = false;
    let escaped = false;
    const startRe = /\[([0-9.:-]+)]\[([ 0-9]*)]LogODKPlayFabProvider: .*?Payload:\s*(\{.*)?$/;
    function feed(chunk) {
        buf.push(chunk);
        for (let i = 0; i < chunk.length; i++) {
            const ch = chunk[i];
            if (escaped) {
                escaped = false;
                continue;
            }
            if (ch === '\\') {
                escaped = true;
                continue;
            }
            if (ch === '"') {
                inString = !inString;
                continue;
            }
            if (!inString) {
                if (ch === '{')
                    depth++;
                else if (ch === '}')
                    depth--;
            }
        }
    }
    function normalizeModsList(raw) {
        if (!Array.isArray(raw))
            return [];
        return raw
            .map((x) => (x == null ? '' : String(x).trim()))
            .filter((s) => s.length > 0);
    }
    function tryParse() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        const jsonText = buf.join('\n').trim();
        collecting = false;
        buf = [];
        const raw = `${firstLine}\n${jsonText}`;
        try {
            const payload = JSON.parse(jsonText);
            const data = {
                raw,
                time,
                chainID,
                event: LogsReaderEvents.ROUND_SUMMARY,
                sessionId: String((_a = payload.session_id) !== null && _a !== void 0 ? _a : ''),
                map: String((_b = payload.Map) !== null && _b !== void 0 ? _b : ''),
                layer: String((_c = payload.Layer) !== null && _c !== void 0 ? _c : ''),
                gameMode: String((_d = payload.GameMode) !== null && _d !== void 0 ? _d : ''),
                durationSec: Number((_e = payload.Duration) !== null && _e !== void 0 ? _e : 0),
                winFaction: String((_f = payload.Win) !== null && _f !== void 0 ? _f : ''),
                winTeamIndex: Number((_g = payload.WinTeamIndex) !== null && _g !== void 0 ? _g : -1),
                winTickets: Number((_h = payload.WinTickets) !== null && _h !== void 0 ? _h : 0),
                winPlayerCount: Number((_j = payload.WinPlayerCount) !== null && _j !== void 0 ? _j : 0),
                loseFaction: String((_k = payload.Lose) !== null && _k !== void 0 ? _k : ''),
                loseTickets: Number((_l = payload.LoseTickets) !== null && _l !== void 0 ? _l : 0),
                losePlayerCount: Number((_m = payload.LosePlayerCount) !== null && _m !== void 0 ? _m : 0),
                licensed: Boolean((_o = payload.Licensed) !== null && _o !== void 0 ? _o : false),
                detailsTeam1: payload.DetailsTeam1,
                detailsTeam2: payload.DetailsTeam2,
                modsList: normalizeModsList(payload.ModsList),
            };
            return data;
        }
        catch (_p) {
            return null;
        }
    }
    return (line) => {
        if (!collecting) {
            const m = line.match(startRe);
            if (!m)
                return null;
            collecting = true;
            time = m[1];
            chainID = m[2];
            firstLine = line;
            buf = [];
            depth = 0;
            inString = false;
            escaped = false;
            const after = line.split('Payload:')[1].trim();
            const idx = after.indexOf('{');
            if (idx !== -1) {
                const tail = after.slice(idx);
                feed(tail);
                if (depth === 0)
                    return tryParse();
            }
            return null;
        }
        feed(line);
        if (depth > 0)
            return null;
        return tryParse();
    };
})();

const grenadeSpawned = (line) => {
    const matches = line.match(/\[([0-9.:-]+)]\[([ 0-9]*)]LogSquadTrace: \[DedicatedServer](?:ASQVehicleSeat::)?ServerSpawnGrenade_Implementation\(\): Grenade Spawned: Instigator=(.+) SpawnLocation=V\((X=[^)]*)\)/);
    if (matches) {
        const data = {
            raw: matches[0],
            time: matches[1],
            chainID: matches[2],
            instigator: matches[3],
            location: matches[4],
            event: LogsReaderEvents.GRENADE_SPAWNED,
        };
        return data;
    }
    return null;
};

let lastRadio = null;
const fobRadioCapture = (line) => {
    const m = line.match(/\[([0-9.:-]+)]\[([ 0-9]*)].*?SetReplicates called on non-initialized actor BP_FOBRadio_[A-Za-z0-9]+_C_(\d+)/i);
    if (m) {
        lastRadio = { chainID: m[2], radioId: m[3] };
    }
    return null;
};
const takeFobRadio = (chainID) => {
    if (lastRadio && lastRadio.chainID === chainID) {
        const id = lastRadio.radioId;
        lastRadio = null;
        return id;
    }
    return null;
};

const fobPlaced = (line) => {
    const matches = line.match(/\[([0-9.:-]+)]\[([ 0-9]*)].*?SQForwardBase for team (\d+) created at X=([\d.-]+) Y=([\d.-]+) Z=([\d.-]+)/);
    if (matches) {
        const radioId = takeFobRadio(matches[2]);
        const data = {
            raw: matches[0],
            time: matches[1],
            chainID: matches[2],
            teamID: matches[3],
            x: matches[4],
            y: matches[5],
            z: matches[6],
            radioId: radioId !== null && radioId !== void 0 ? radioId : undefined,
            isMain: !radioId,
            event: LogsReaderEvents.FOB_PLACED,
        };
        return data;
    }
    return null;
};

const rallyPlaced = (line) => {
    const matches = line.match(/\[([0-9.:-]+)]\[([ 0-9]*)].*?SQGameRallyPoint\s+\S+\s+for team (\d+) at X=([\d.-]+) Y=([\d.-]+) Z=([\d.-]+) created/);
    if (matches) {
        const data = {
            raw: matches[0],
            time: matches[1],
            chainID: matches[2],
            teamID: matches[3],
            x: matches[4],
            y: matches[5],
            z: matches[6],
            event: LogsReaderEvents.RALLY_PLACED,
        };
        return data;
    }
    return null;
};

const playerRespawn = (line) => {
    const matches = line.match(/\[([0-9.:-]+)]\[([ 0-9]*)].*?RestartPlayer\(\):\s*On Server PC=(.+?)\s+Spawn=(\S+)\s+DeployRole=(\S+)/);
    if (matches) {
        const data = {
            raw: matches[0],
            time: matches[1],
            chainID: matches[2],
            playerController: matches[3],
            spawn: matches[4],
            role: matches[5],
            event: LogsReaderEvents.PLAYER_RESPAWN,
        };
        return data;
    }
    return null;
};

// Вход в технику (с номером сиденья)
const ENTER = /\[([0-9.:-]+)]\[([ 0-9]*)].*?OnPossess\(\):\s*PC=(.+?)\s+\(Online IDs:\s*EOS:\s*(\w+)\s+steam:\s*(\d+)\)\s*Entered Vehicle\s+Pawn=.+?\s+\(Asset Name\s*=\s*([^)]+)\).*?Seat Number=(\d+)/;
// Выход из техники (с номером сиденья)
const EXIT = /\[([0-9.:-]+)]\[([ 0-9]*)].*?OnUnPossess\(\):\s*PC=(.+?)\s+\(Online IDs:\s*EOS:\s*(\w+)\s+steam:\s*(\d+)\)\s*Exited Vehicle\s+Pawn=.+?\s+\(Asset Name\s*=\s*([^)]+)\).*?Seat Number=(\d+)/;
const vehicleSeat = (line) => {
    let matches = line.match(ENTER);
    let action = 'enter';
    if (!matches) {
        matches = line.match(EXIT);
        action = 'exit';
    }
    if (matches) {
        const data = {
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

const eacAction = (line) => {
    const matches = line.match(/\[([0-9.:-]+)]\[([ 0-9]*)].*?\[ClientActionRequired]\s*Client:\s*(\S+)\s+Action:\s*(\d+)\s+ActionReason:\s*(\d+)\s+Details:\s*(.+)/);
    if (matches) {
        const data = {
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

const playerStateChanged = (line) => {
    const matches = line.match(/\[([0-9.:-]+)]\[([ 0-9]*)].*?ChangeState\(\):\s*PC=(.+?)\s+\(Online IDs:\s*EOS:\s*(\w+)\s+steam:\s*(\d+)\)\s+OldState=(\w+)\s+NewState=(\w+)/);
    if (matches) {
        const data = {
            raw: matches[0],
            time: matches[1],
            chainID: matches[2],
            name: matches[3],
            eosID: matches[4],
            steamID: matches[5],
            oldState: matches[6],
            newState: matches[7],
            event: LogsReaderEvents.PLAYER_STATE_CHANGED,
        };
        return data;
    }
    return null;
};

const matchResult = (line) => {
    const matches = line.match(/\[([0-9.:-]+)]\[([ 0-9]*)].*?Team\s+(\d+),\s*(.+?)\s+\(\s*(.+?)\s*\)\s+has\s+(won|lost)\s+the match with\s+(\d+)\s+Tickets on layer\s+(.+?)\s+\(level\s+(.+?)\)/);
    if (matches) {
        const data = {
            raw: matches[0],
            time: matches[1],
            chainID: matches[2],
            teamID: matches[3],
            faction: matches[4],
            subfaction: matches[5],
            result: matches[6],
            tickets: matches[7],
            layer: matches[8],
            level: matches[9],
            event: LogsReaderEvents.MATCH_RESULT,
        };
        return data;
    }
    return null;
};

// "Set next layer to <layer> <F1>+<S1> <F2>+<S2>"
const SET = /\[([0-9.:-]+)]\[([ 0-9]*)].*?ADMIN COMMAND:\s*Set next layer to\s+(\S+)\s+(\w+)\+(\w+)\s+(\w+)\+(\w+)/;
// "Change layer to <layer> <F1> <F2>"
const CHANGE = /\[([0-9.:-]+)]\[([ 0-9]*)].*?ADMIN COMMAND:\s*Change layer to\s+(\S+)\s+(\w+)\s+(\w+)/;
const nextLayer = (line) => {
    let m = line.match(SET);
    if (m) {
        const data = {
            raw: m[0],
            time: m[1],
            chainID: m[2],
            action: 'set',
            layer: m[3],
            team1Faction: m[4],
            team1Subfaction: m[5],
            team2Faction: m[6],
            team2Subfaction: m[7],
            event: LogsReaderEvents.NEXT_LAYER_SET,
        };
        return data;
    }
    m = line.match(CHANGE);
    if (m) {
        const data = {
            raw: m[0],
            time: m[1],
            chainID: m[2],
            action: 'change',
            layer: m[3],
            team1Faction: m[4],
            team2Faction: m[5],
            event: LogsReaderEvents.NEXT_LAYER_SET,
        };
        return data;
    }
    return null;
};

const PREFIX = /\[([0-9.:-]+)]\[([ 0-9]*)].*?/;
const re = (body) => new RegExp(PREFIX.source + body.source);
const KICK = re(/ADMIN COMMAND:\s*Kicked player\s+\d+\.\s*\[Online IDs=\s*EOS:\s*(\w+)\s+steam:\s*(\d+)]\s*(.+?)\s+from\s+RCON/);
const TEAMCHANGE = re(/ADMIN COMMAND:\s*Forced team change for player\s+\d+\.\s*\[Online IDs=\s*EOS:\s*(\w+)\s+steam:\s*(\d+)]\s*(.+?)\s+from\s+RCON/);
const DISBAND = re(/ADMIN COMMAND:\s*Remote admin disbanded squad\s+(\d+)\s+on team\s+(\d+),\s*named "(.+?)"/);
const AUTO_BAN = /\[([0-9.:-]+)]\[([ 0-9]*)].*?Banning player:\s*(.+?)\s*;\s*Reason\s*=\s*(.+)/;
const WARN = re(/ADMIN COMMAND:\s*Remote admin has warned player\s+(.+?)\.\s*Message was "(.+?)"\s*from/);
const adminAction = (line) => {
    let m = line.match(KICK);
    if (m) {
        return {
            raw: m[0], time: m[1], chainID: m[2], action: 'kick',
            eosID: m[3], steamID: m[4], name: m[5],
            event: LogsReaderEvents.ADMIN_ACTION,
        };
    }
    m = line.match(TEAMCHANGE);
    if (m) {
        return {
            raw: m[0], time: m[1], chainID: m[2], action: 'forceTeamChange',
            eosID: m[3], steamID: m[4], name: m[5],
            event: LogsReaderEvents.ADMIN_ACTION,
        };
    }
    m = line.match(DISBAND);
    if (m) {
        return {
            raw: m[0], time: m[1], chainID: m[2], action: 'disband',
            squadID: m[3], teamID: m[4], squadName: m[5],
            event: LogsReaderEvents.ADMIN_ACTION,
        };
    }
    m = line.match(WARN);
    if (m) {
        return {
            raw: m[0], time: m[1], chainID: m[2], action: 'warn',
            name: m[3], message: m[4],
            event: LogsReaderEvents.ADMIN_ACTION,
        };
    }
    m = line.match(AUTO_BAN);
    if (m) {
        return {
            raw: m[0], time: m[1], chainID: m[2], action: 'autoBan',
            name: m[3], reason: m[4],
            event: LogsReaderEvents.ADMIN_ACTION,
        };
    }
    return null;
};

const parsers = [
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
const parseLine = (line, emitter) => {
    for (let i = 0; i < parsers.length; i++) {
        const result = parsers[i](line);
        if (result) {
            emitter.emit(result.event, result);
            break;
        }
    }
};

var _LogsReader_instances, _LogsReader_parseLine, _LogsReader_pending, _LogsReader_flushTimer, _LogsReader_feedLine, _LogsReader_parseConfigUsers, _LogsReader_ftpReader, _LogsReader_localReader;
class LogsReader extends EventEmitter {
    constructor(options) {
        super();
        _LogsReader_instances.add(this);
        // Буфер для склейки многострочных записей лога.
        _LogsReader_pending.set(this, '');
        _LogsReader_flushTimer.set(this, null);
        for (const option of [
            'id',
            'filePath',
            'adminsFilePath',
            'readType',
            'autoReconnect',
        ])
            if (!(option in options))
                throw new Error(`${option} required!`);
        if (options.readType === 'remote') {
            for (const option of ['host', 'username', 'password'])
                if (!(option in options))
                    throw new Error(`${option} required for remote!`);
        }
        const { id, filePath, adminsFilePath, autoReconnect, readType, host, username, password, logEnabled, timeout, } = options;
        this.id = id;
        this.filePath = filePath;
        this.adminsFilePath = adminsFilePath;
        this.autoReconnect = autoReconnect;
        this.readType = readType;
        this.logEnabled = logEnabled;
        this.timeout = timeout;
        this.sftpConnected = false;
        if (readType === 'remote') {
            this.host = host;
            this.username = username;
            this.password = password;
        }
        this.logger = initLogger(this.id, typeof options.logEnabled === 'undefined'
            ? true
            : options === null || options === void 0 ? void 0 : options.logEnabled);
        this.setMaxListeners(20);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((res) => {
                this.on('connected', () => res(true));
                switch (this.readType) {
                    case 'local': {
                        __classPrivateFieldGet(this, _LogsReader_instances, "m", _LogsReader_localReader).call(this);
                    }
                    case 'remote': {
                        __classPrivateFieldGet(this, _LogsReader_instances, "m", _LogsReader_ftpReader).call(this);
                    }
                }
            });
        });
    }
    getAdminsFile() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                var _a, e_1, _b, _c;
                try {
                    switch (this.readType) {
                        case 'local': {
                            if (!fs.existsSync(this.adminsFilePath))
                                reject(`Not found admins file`);
                            const data = __classPrivateFieldGet(this, _LogsReader_instances, "m", _LogsReader_parseConfigUsers).call(this, fs.readFileSync(this.adminsFilePath, 'utf8'));
                            resolve(data);
                        }
                        case 'remote': {
                            if (this.sftp && this.sftpConnected) {
                                const t = this.sftp.createReadStream(this.adminsFilePath);
                                const chunks = [];
                                try {
                                    for (var _d = true, t_1 = __asyncValues(t), t_1_1; t_1_1 = yield t_1.next(), _a = t_1_1.done, !_a; _d = true) {
                                        _c = t_1_1.value;
                                        _d = false;
                                        const chunk = _c;
                                        chunks.push(Buffer.from(chunk));
                                    }
                                }
                                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                                finally {
                                    try {
                                        if (!_d && !_a && (_b = t_1.return)) yield _b.call(t_1);
                                    }
                                    finally { if (e_1) throw e_1.error; }
                                }
                                const data = __classPrivateFieldGet(this, _LogsReader_instances, "m", _LogsReader_parseConfigUsers).call(this, Buffer.concat(chunks).toString('utf-8'));
                                resolve(data);
                            }
                        }
                    }
                    reject('Cannot read admins file');
                }
                catch (error) {
                    reject(error);
                }
            }));
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.sftp && this.sftpConnected) {
                yield this.sftp.end();
                this.sftp = undefined;
                this.sftpConnected = false;
                this.logger.warn('Close connection');
                this.emit('close');
            }
            if (this.tail) {
                this.tail.unwatch();
                this.tail = undefined;
                this.logger.warn('Close connection');
                this.emit('close');
            }
        });
    }
}
_LogsReader_pending = new WeakMap(), _LogsReader_flushTimer = new WeakMap(), _LogsReader_instances = new WeakSet(), _LogsReader_parseLine = function _LogsReader_parseLine(line) {
    parseLine(line, this);
}, _LogsReader_feedLine = function _LogsReader_feedLine(line) {
    const isEntryStart = /\[\d{4}\.\d{2}\.\d{2}-\d{2}\.\d{2}\.\d{2}:\d{3}\]/.test(line);
    if (isEntryStart) {
        if (__classPrivateFieldGet(this, _LogsReader_pending, "f"))
            __classPrivateFieldGet(this, _LogsReader_instances, "m", _LogsReader_parseLine).call(this, __classPrivateFieldGet(this, _LogsReader_pending, "f"));
        __classPrivateFieldSet(this, _LogsReader_pending, line, "f");
    }
    else if (__classPrivateFieldGet(this, _LogsReader_pending, "f")) {
        __classPrivateFieldSet(this, _LogsReader_pending, __classPrivateFieldGet(this, _LogsReader_pending, "f") + (' ' + line), "f");
    }
    else {
        __classPrivateFieldSet(this, _LogsReader_pending, line, "f");
    }
    // Дебаунс: если новых строк нет ~1с — распарсить накопленную запись
    // (чтобы последняя запись не зависала во время тишины).
    if (__classPrivateFieldGet(this, _LogsReader_flushTimer, "f"))
        clearTimeout(__classPrivateFieldGet(this, _LogsReader_flushTimer, "f"));
    __classPrivateFieldSet(this, _LogsReader_flushTimer, setTimeout(() => {
        if (__classPrivateFieldGet(this, _LogsReader_pending, "f")) {
            __classPrivateFieldGet(this, _LogsReader_instances, "m", _LogsReader_parseLine).call(this, __classPrivateFieldGet(this, _LogsReader_pending, "f"));
            __classPrivateFieldSet(this, _LogsReader_pending, '', "f");
        }
    }, 1000), "f");
}, _LogsReader_parseConfigUsers = function _LogsReader_parseConfigUsers(data) {
    var _a, _b, _c, _d;
    const groups = {};
    const admins = {};
    const groupRgx = /(?<=^Group=)(?<groupID>.*?):(?<groupPerms>.*?)(?=(?:\r\n|\r|\n|\s+\/\/))/gm;
    const adminRgx = /(?<=^Admin=)(?<steamID>\d+):(?<groupID>\S+)/gm;
    for (const m of data.matchAll(groupRgx)) {
        const groupID = (_a = m.groups) === null || _a === void 0 ? void 0 : _a.groupID;
        const groupPerms = (_b = m.groups) === null || _b === void 0 ? void 0 : _b.groupPerms;
        if (groupID && groupPerms) {
            groups[groupID] = groupPerms.split(',');
        }
    }
    for (const m of data.matchAll(adminRgx)) {
        const groupID = (_c = m.groups) === null || _c === void 0 ? void 0 : _c.groupID;
        if (groupID) {
            const group = groups[groupID];
            const perms = {};
            for (const groupPerm of group)
                perms[groupPerm.toLowerCase()] = true;
            const steamID = (_d = m.groups) === null || _d === void 0 ? void 0 : _d.steamID;
            if (steamID) {
                if (steamID in admins) {
                    admins[steamID] = Object.assign(admins[steamID], perms);
                }
                else {
                    admins[steamID] = Object.assign(perms);
                }
            }
        }
    }
    return admins;
}, _LogsReader_ftpReader = function _LogsReader_ftpReader() {
    return __awaiter(this, void 0, void 0, function* () {
        const { host, password, username, filePath } = this;
        if (host &&
            password &&
            username &&
            filePath &&
            !this.sftp &&
            !this.sftpConnected) {
            try {
                this.sftp = new SFTPClient();
                const connected = yield this.sftp.connect({
                    port: 22,
                    host,
                    username,
                    password,
                });
                if (connected) {
                    let lastSize = (yield this.sftp.stat(filePath)).size;
                    let canStart = true;
                    this.emit('connected');
                    this.logger.log('Connected to FTP server');
                    this.sftpConnected = true;
                    for (;;) {
                        if (this.sftp) {
                            const { size } = yield this.sftp.stat(filePath);
                            if (canStart && lastSize != size) {
                                canStart = false;
                                const stream = this.sftp.createReadStream(filePath, {
                                    start: lastSize,
                                    end: size,
                                });
                                const rl = readline.createInterface({
                                    input: stream,
                                    crlfDelay: Infinity,
                                });
                                rl.on('line', (line) => {
                                    __classPrivateFieldGet(this, _LogsReader_instances, "m", _LogsReader_feedLine).call(this, line);
                                });
                                rl.on('close', () => {
                                    lastSize = size;
                                    canStart = true;
                                });
                            }
                        }
                    }
                }
            }
            catch (error) {
                this.logger.error('FTP connection lost');
                this.logger.error(error);
                this.emit('close');
                this.sftpConnected = false;
                this.sftp = undefined;
                if (this.autoReconnect) {
                    setTimeout(() => {
                        this.logger.log('Reconnect to FTP');
                        __classPrivateFieldGet(this, _LogsReader_instances, "m", _LogsReader_ftpReader).call(this);
                    }, 5000);
                }
            }
        }
    });
}, _LogsReader_localReader = function _LogsReader_localReader() {
    try {
        this.tail = new Tail(this.filePath);
        this.logger.log('Connected');
        this.emit('connected');
        this.tail.on('line', (data) => {
            __classPrivateFieldGet(this, _LogsReader_instances, "m", _LogsReader_feedLine).call(this, data);
        });
    }
    catch (error) {
        this.logger.error('Connection lost');
        this.logger.error(error);
        this.emit('close');
        if (this.autoReconnect) {
            setTimeout(() => {
                this.logger.log('Reconnect');
                __classPrivateFieldGet(this, _LogsReader_instances, "m", _LogsReader_localReader).call(this);
            }, 5000);
        }
    }
};

export { LogsReader, LogsReaderEvents };
