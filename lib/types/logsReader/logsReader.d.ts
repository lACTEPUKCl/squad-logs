/// <reference types="node" />
import EventEmitter from 'events';
import SFTPClient from 'ssh2-sftp-client';
import { Tail } from 'tail';
import { initLogger } from '../logger';
import { TLogReaderOptions } from '../types';
export declare class LogsReader extends EventEmitter {
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
