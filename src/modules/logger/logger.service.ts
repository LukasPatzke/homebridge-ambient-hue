import { ConsoleLogger, LogLevel } from '@nestjs/common';
import chalk from 'chalk';

export const enum LogLevels {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

export class CustomLogger extends ConsoleLogger {

  constructor(protected context: string) {
    const logLevels: LogLevel[] = ['log', 'error', 'warn'];
    if (process.env.AMBIENTHUE_DEBUG === 'TRUE') {
      logLevels.push('debug');
    }
    super(context, { logLevels: logLevels });
  }

  protected formatContext(context: string): string {
    if (!context) {
      return chalk.cyan('[AmbientHue]');
    }
    return chalk.cyan(`[AmbientHue:${chalk.green(context)}]`);
  }

  protected getTimestamp(): string {
    const date = new Date();
    return date.toLocaleString();
  }

  protected formatMessage(
    logLevel: LogLevel,
    message: unknown,
    pidMessage: string,
    formattedLogLevel: string,
    contextMessage: string,
    timestampDiff: string): string {
    const output = this.stringifyMessage(message, logLevel);
    return `[${this.getTimestamp()}] ${contextMessage} ${output} ${timestampDiff}\n`;
  }

  protected colorize(message: string, logLevel: LogLevel): string {
    return this.color(logLevel)(message);
  }

  private color(level: LogLevel) {
    switch (level) {
      case 'debug':
        return chalk.gray;
      case 'warn':
        return chalk.yellow;
      case 'error':
        return chalk.red;
      case 'verbose':
        return chalk.cyanBright;
      default:
        return chalk.white;
    }
  }
}
