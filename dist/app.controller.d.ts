import { AppService } from './app.service';
import { Response } from 'express';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getRedirectUrl(response: Response, ip: any, headers: Record<string, string>, shortId: string): Promise<void>;
    getHomePage(): string;
}
