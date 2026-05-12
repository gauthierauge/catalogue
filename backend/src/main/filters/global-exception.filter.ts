import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
    statusCode: number;
    message: string;
    error?: string;
    timestamp: string;
    path: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
            exception instanceof HttpException
                ? exception.message
                : 'Internal server error';

        const errorResponse: ErrorResponse = {
            statusCode: status,
            message,
            error:
                exception instanceof HttpException
                    ? exception.name
                    : 'InternalServerError',
            timestamp: new Date().toISOString(),
            path: request.url,
        };

        if (status >= 500) {
            this.logger.error(
                `${request.method} ${request.url} - ${status} - ${message}`,
                exception instanceof Error ? exception.stack : undefined,
            );
        } else {
            this.logger.warn(
                `${request.method} ${request.url} - ${status} - ${message}`,
            );
        }

        response.status(status).json(errorResponse);
    }
}
