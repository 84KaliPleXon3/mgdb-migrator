import { Db } from 'mongodb';
export declare type SyslogLevels = 'debug' | 'info' | 'notice' | 'warning' | 'error' | 'crit' | 'alert';
export interface IMigrationOptions {
    log?: boolean;
    logger?: (level: SyslogLevels, ...args: any[]) => void;
    logIfLatest?: boolean;
    collectionName?: string;
    db: string | Db;
}
export interface IMigration {
    version: number;
    name: string;
    up: (db: Db) => Promise<any> | any;
    down: (db: Db) => Promise<any> | any;
}
export declare class Migration {
    private defaultMigration;
    private list;
    private collection;
    private db;
    private options;
    constructor(opts?: IMigrationOptions);
    config(opts?: IMigrationOptions): Promise<void>;
    add(migration: IMigration): void;
    migrateTo(command: string | number): Promise<void>;
    getNumberOfMigrations(): number;
    getVersion(): Promise<number>;
    unlock(): void;
    reset(): Promise<void>;
    private execute;
    private getControl;
    private setControl;
    private findIndexByVersion;
}
