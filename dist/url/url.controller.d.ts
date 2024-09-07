import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
export declare class UrlController {
    private readonly urlService;
    constructor(urlService: UrlService);
    createNewShortUrl(createUrlDto: CreateUrlDto): any;
    getReports(shortId: string): Promise<any>;
}
