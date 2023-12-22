import { EnvController } from '@app/checkers/env.controller';
import { HealthController } from '@app/checkers/health.controller';
import { DatabasesModule } from '@app/config/database/databases.module';
import { AuthModule } from '@app/config/security/auth/auth.module';
import { SequelizeAttachReqToModelMiddleware } from '@app/core/http/sequelize-attach-req-to-model.middleware';
import { TransformaRespostaInterceptor } from '@app/core/http/transform-response.interceptor';
import { ResoursesModule } from '@app/resources/resourses.module';
import { ClassSerializerInterceptor, MiddlewareConsumer, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';
import * as path from 'path';

@Module({
  imports: [
    ResoursesModule,
    DatabasesModule,
    AuthModule,
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        AcceptLanguageResolver
      ]
    }),
  ],
  controllers: [EnvController, HealthController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformaRespostaInterceptor
    }
  ]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SequelizeAttachReqToModelMiddleware)
      .forRoutes('*');
  }
}
