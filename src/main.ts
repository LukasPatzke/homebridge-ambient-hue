import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import * as fs from 'fs-extra';
import * as path from 'path';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { FastifyRequest, FastifyReply } from 'fastify';
import { AppModule } from './app.module';


process.env.HAH_BASE_PATH = path.resolve(__dirname, '../');

export async function bootstrap() {
  const fAdapter = new FastifyAdapter();
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, fAdapter);

  // serve index.html without a cache
  app.getHttpAdapter().get('/', async (req: FastifyRequest, res: FastifyReply) => {
    res.type('text/html');
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
    res.send(await fs.readFile(path.resolve((process.env.HAH_BASE_PATH||''), 'public/index.html')));
  });

  // serve static assest with a long cache timeout
  app.useStaticAssets({
    root: path.resolve(__dirname, '../public'),
    setHeaders(res) {
      res.setHeader('Cache-Control', 'public,max-age=31536000,immutable');
    },
  });

  // set prefix
  app.setGlobalPrefix('api');

  // setup swagger api doc generator
  const options = new DocumentBuilder()
    .setTitle('AmbientHUE API Reference')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(3000, '0.0.0.0');

  return app;
}

export const app = bootstrap();
