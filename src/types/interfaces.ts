export interface IConstructor {
    url: string;
    location?: string;
}

export interface IGithub {
    key: string;
    per: 'minutes' | 'hours' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    options: {
        owner: string;
        repo: string;
    };
}

export interface ILocalize {
    per: 'minutes' | 'hours' | 'daily' | 'weekly' | 'monthly' | 'yearly';
}