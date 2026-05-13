import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../logger/logger.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    constructor(private readonly logger: LoggerService) { }

    use(req: Request, res: Response, next: NextFunction) {
        const requestId = uuidv4();
        req['requestId'] = requestId;

        const startTime = Date.now();
        const { method, originalUrl, ip } = req;
        const userAgent = req.get('user-agent') || '';

        res.on('finish', () => {
            const duration = Date.now() - startTime;
            const { statusCode } = res;

            this.logger.logHttp({
                requestId,
                method,
                path: originalUrl,
                statusCode,
                duration,
                ip,
                userAgent,
            });
        });

        next();
    }
}
