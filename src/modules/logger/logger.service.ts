import { LoggerService } from '@nestjs/common';
import util from 'util';
import chalk from 'chalk';
import { ConfigService } from '../config/config.service';

export const enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

export class CustomLogger implements LoggerService {
  constructor(private configService: ConfigService, private context: string) { }

  log(message: any, context: string = this.context, level?: LogLevel, trace?: string) {
    /* your implementation */
    message = util.format(this.maskApiKey(message));

    let loggingFunction = console.log;
    switch (level) {
      case LogLevel.WARN:
        message = chalk.yellow(message);
        loggingFunction = console.error;
        break;
      case LogLevel.ERROR:
        message = chalk.red(message);
        loggingFunction = console.error;
        break;
      case LogLevel.DEBUG:
        if (this.configService.debugLog) {
          message = chalk.gray(message);
        } else {
          message = undefined;
        }
        break;
      case LogLevel.VERBOSE:
        if (this.configService.debugLog) {
          message = chalk.gray(message);
        } else {
          message = undefined;
        }
        break;
      case undefined:
        message = chalk.gray(message);
    }

    if (message !== undefined) {
      message = chalk.cyan(`[AmbientHue:${chalk.green(context)}] `) + message;

      const date = new Date();
      message = chalk.white(`[${date.toLocaleString()}] `) + message;

      loggingFunction(message);
      if (trace) {
        loggingFunction(chalk.gray(trace));
      }
    }
  }

  private maskApiKey(message: string): string {
    const expression = new RegExp(this.configService.hueUser||'', 'i');
    return message.replace(expression, '<api_key>');
  }

  error(message: string, context?: string, trace?: string) {
    this.log(message, context, LogLevel.ERROR, trace);
  }

  warn(message: string, context?: string) {
    this.log(message, context, LogLevel.WARN);
  }

  debug(message: string, context?: string) {
    this.log(message, context, LogLevel.DEBUG);
  }

  verbose(message: string, context?: string) {
    this.log(message, context, LogLevel.VERBOSE);
  }
}
