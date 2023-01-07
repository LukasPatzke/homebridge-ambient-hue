import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as path from 'path';
import { AppModule } from './app.module';
import { ConfigService } from './modules/config/config.service';
import { CustomLogger } from './modules/logger/logger.service';

process.env.HAH_BASE_PATH = path.resolve(__dirname, '../');

export async function bootstrap() {
  const fAdapter = new FastifyAdapter();
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fAdapter,
    { logger: new CustomLogger('Root') },
  );
  const config = app.get(ConfigService);

  // set prefix
  app.setGlobalPrefix('api');

  // setup swagger api doc generator
  const options = new DocumentBuilder()
    .setTitle('AmbientHUE API Reference')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  await app.listen(config.uiPort, config.uiHost);

  return app;
}

// export const app = bootstrap();
