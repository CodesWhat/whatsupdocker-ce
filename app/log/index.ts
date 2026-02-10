// @ts-nocheck
import bunyan from 'bunyan';
import { getLogLevel } from '../configuration/index.js';

// Init Bunyan logger
const logger = bunyan.createLogger({
    name: 'drydock',
    level: getLogLevel(),
});

export default logger;
