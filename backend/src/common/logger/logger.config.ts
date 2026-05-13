import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
);

const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
        let msg = `${timestamp} [${context || 'Catalog'}] ${level}: ${message}`;

        const metaKeys = Object.keys(meta).filter((key) => key !== 'service');
        if (metaKeys.length > 0) {
            const relevantMeta: any = {};
            metaKeys.forEach((key) => {
                if (meta[key] !== undefined) {
                    relevantMeta[key] = meta[key];
                }
            });
            if (Object.keys(relevantMeta).length > 0) {
                msg += ` ${JSON.stringify(relevantMeta)}`;
            }
        }

        return msg;
    }),
);

const applicationTransport = new DailyRotateFile({
    filename: '/var/log/app/catalogue-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '7d',
    format: logFormat,
    level: 'info',
});

const errorTransport = new DailyRotateFile({
    filename: '/var/log/app/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '7d',
    format: logFormat,
    level: 'error',
});

const consoleTransport = new winston.transports.Console({
    format: consoleFormat,
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
});

export const createLogger = () => {
    return winston.createLogger({
        defaultMeta: {
            service: 'catalogue',
            environment: process.env.NODE_ENV || 'development',
        },
        transports: [applicationTransport, errorTransport, consoleTransport],
    });
};
