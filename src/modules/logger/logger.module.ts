import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { CustomLogger } from './logger.service';

@Module({
  imports: [ConfigModule],
  providers: [CustomLogger],
  exports: [CustomLogger],
})
export class LoggerModule { }
