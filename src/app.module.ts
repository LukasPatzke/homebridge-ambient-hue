import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccessoryModule } from './modules/accessory/accessory.module';
import { ConfigModule } from './modules/config/config.module';
import { ConfigService } from './modules/config/config.service';
import { CurveModule } from './modules/curve/curve.module';
import { GroupModule } from './modules/group/group.module';
import { HealthModule } from './modules/health/health.module';
import { HueModule } from './modules/hue/hue.module';
import { LightModule } from './modules/light/light.module';
import { LoggerModule } from './modules/logger/logger.module';
import { PointModule } from './modules/point/point.module';
import { TasksModule } from './modules/tasks/tasks.module';
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        configService.getTypeOrmConfig(),
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    ScheduleModule.forRoot(),
    HueModule,
    LightModule,
    GroupModule,
    CurveModule,
    PointModule,
    TasksModule,
    HealthModule,
    ConfigModule,
    LoggerModule,
    AccessoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
