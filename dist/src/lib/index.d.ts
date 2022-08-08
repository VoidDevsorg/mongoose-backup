/// <reference types="node" />
import { EventEmitter } from "events";
import { IConstructor, IGithub, ILocalize } from "src/types/interfaces";
export declare class Backuper extends EventEmitter {
    connected: boolean;
    url: string;
    logger: boolean;
    location: string;
    getDocuments: Function;
    getDocument: Function;
    constructor({ url, location }: IConstructor);
    Github({ key, per, options }: IGithub): Promise<any>;
    Localize({ per }: ILocalize): Promise<any>;
}
