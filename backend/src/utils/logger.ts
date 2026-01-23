type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  requestId?: string;
  [key: string]: any;
}

class Logger {
  private defaultLogLevel: LogLevel;

  // Sensitive field patterns to redact
  private sensitivePatterns = [
    /password/i,
    /secret/i,
    /token/i,
    /api[_-]?key/i,
    /auth/i,
    /bearer/i,
    /credential/i,
    /private[_-]?key/i,
    /access[_-]?key/i,
    /session/i,
    /cookie/i,
    /ssn/i,
    /social[_-]?security/i,
    /credit[_-]?card/i,
    /card[_-]?number/i,
    /cvv/i,
    /stripe[_-]?key/i,
    /supabase[_-]?key/i,
  ];

  constructor() {
    this.defaultLogLevel = 'info';
  }

  private currentLogLevel(): LogLevel {
    const envLevel = process.env.LOG_LEVEL as LogLevel | undefined;
    return envLevel || this.defaultLogLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.currentLogLevel());
  }

  /**
   * Redact sensitive information from logs
   */
  private redactSensitiveData(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      // Redact potential JWT tokens (looks like: xxx.yyy.zzz)
      if (obj.match(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/)) {
        return '[REDACTED_JWT]';
      }
      // Redact long base64-like strings (likely keys/tokens)
      if (obj.length > 32 && obj.match(/^[A-Za-z0-9+/=_-]+$/)) {
        return '[REDACTED_TOKEN]';
      }
      return obj;
    }

    if (typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.redactSensitiveData(item));
    }

    const redacted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Check if key matches sensitive patterns
      const isSensitive = this.sensitivePatterns.some((pattern) => pattern.test(key));

      if (isSensitive) {
        redacted[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        redacted[key] = this.redactSensitiveData(value);
      } else {
        redacted[key] = value;
      }
    }
    return redacted;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();

    // Redact sensitive data from context
    const safeContext = context ? this.redactSensitiveData(context) : {};

    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...safeContext,
    };
    return JSON.stringify(logEntry);
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  error(message: string, error?: Error, context?: LogContext): void {
    if (this.shouldLog('error')) {
      const errorContext = {
        ...context,
        error: error?.message,
        stack: error?.stack,
        name: error?.name,
      };
      console.error(this.formatMessage('error', message, errorContext));
    }
  }
}

export const logger = new Logger();
