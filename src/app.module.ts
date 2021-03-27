import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './db.sqlite',
      entities: [],
      logging: false,
      synchronize: true,
      keepConnectionAlive: true,
      autoLoadEntities: true,
      migrations: ['migration/*.ts'],
      cli: {
        'migrationsDir': 'migration',
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    HueModule,
    LightModule,
    GroupModule,
    CurveModule,
    PointModule,
    PositionModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
