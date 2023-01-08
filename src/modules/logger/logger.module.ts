import { Module } from '@nestjs/common';
import { CustomLogger } from './logger.service';

@Module({
  imports: [],
  providers: [CustomLogger],
  exports: [CustomLogger],
})
export class LoggerModule {}
