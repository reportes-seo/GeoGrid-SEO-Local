/**
 * Logger utility
 * Provides structured logging with different levels
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

const COLORS = {
  ERROR: '\x1b[31m', // Red
  WARN: '\x1b[33m',  // Yellow
  INFO: '\x1b[36m',  // Cyan
  DEBUG: '\x1b[90m', // Gray
  RESET: '\x1b[0m'
};

class Logger {
  constructor() {
    this.level = process.env.LOG_LEVEL || 'INFO';
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  log(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const color = COLORS[level] || '';
    const reset = COLORS.RESET;

    const logEntry = {
      timestamp,
      level,
      message,
      ...meta
    };

    if (this.isDevelopment) {
      console.log(
        `${color}[${timestamp}] ${level}:${reset}`,
        message,
        Object.keys(meta).length > 0 ? meta : ''
      );
    } else {
      console.log(JSON.stringify(logEntry));
    }
  }

  error(message, meta = {}) {
    this.log(LOG_LEVELS.ERROR, message, meta);
  }

  warn(message, meta = {}) {
    this.log(LOG_LEVELS.WARN, message, meta);
  }

  info(message, meta = {}) {
    this.log(LOG_LEVELS.INFO, message, meta);
  }

  debug(message, meta = {}) {
    if (this.level === 'DEBUG' || this.isDevelopment) {
      this.log(LOG_LEVELS.DEBUG, message, meta);
    }
  }
}

module.exports = new Logger();
