import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { createLogger } from './logger.config';

@Injectable()
export class LoggerService implements NestLoggerService {
    private logger;
    private context: string = 'Catalog';

    constructor() {
        this.logger = createLogger();
    }

    setContext(context: string) {
        this.context = context;
        return this;
    }

    log(message: string, meta?: any) {
        this.logger.info(message, { context: this.context, ...meta });
    }

    error(message: string, trace?: string, meta?: any) {
        this.logger.error(message, {
            context: this.context,
            stack: trace,
            ...meta,
        });
    }

    warn(message: string, meta?: any) {
        this.logger.warn(message, { context: this.context, ...meta });
    }

    debug(message: string, meta?: any) {
        this.logger.debug(message, { context: this.context, ...meta });
    }

    verbose(message: string, meta?: any) {
        this.logger.verbose(message, { context: this.context, ...meta });
    }

    logHttp(data: {
        requestId: string;
        method: string;
        path: string;
        statusCode: number;
        duration: number;
        ip?: string;
        userAgent?: string;
    }) {
        const { requestId, method, path, statusCode, duration, ip, userAgent } = data;

        const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

        this.logger.log(level, 'HTTP Request', {
            context: 'HTTP',
            requestId,
            method,
            path,
            statusCode,
            duration,
            ip,
            userAgent,
        });
    }
}
