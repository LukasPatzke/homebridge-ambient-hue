import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LightModule } from './modules/light/light.module';
import { GroupModule } from './modules/group/group.module';
import { CurveModule } from './modules/curve/curve.module';
import { PositionModule } from './modules/position/position.module';
import { HueModule } from './modules/hue/hue.module';
import { PointModule } from './modules/point/point.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { HealthModule } from './modules/health/health.module';
import { ConfigModule } from './modules/config/config.module';
import { ConfigService } from './modules/config/config.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.database,
        entities: [],
        logging: false,
        synchronize: true,
        keepConnectionAlive: true,
        autoLoadEntities: true,
        migrations: ['migration/*.ts'],
        cli: {
          migrationsDir: 'migration',
        },
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    HueModule,
    LightModule,
    GroupModule,
    CurveModule,
    PointModule,
    PositionModule,
    TasksModule,
    HealthModule,
    ConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
