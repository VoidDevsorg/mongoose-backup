export interface Events {
    message: string;
    location: string;
    logger: boolean;
    url: string;
    time: Date;
    total: number;
    items: Array<any>;
}