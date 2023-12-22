if (!process.env.IS_TS_NODE) {
  require('module-alias/register');
}

import { AppModule } from '@app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { enableOpenApi } from "./config/swagger.config";
import helmet from 'helmet';

function originFromEnv() {
  if (process.env.NODE_ENV === 'prod') return 'https://app.timerdoc.com.br'
  // else if (process.env.NODE_ENV === 'homolog') return 'https://app-hml.timerdoc.com.br'
  else return '*';
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: originFromEnv(),
    methods: '*',
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization']
  });
  
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true, // Mappei apenas propriedades listadas
      forbidNonWhitelisted: true // devolva erro caso envio de propriedades não mapeadas
    })
  );
  useContainer(app.select(AppModule), { fallbackOnErrors: true });


  enableOpenApi(app);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
