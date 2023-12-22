import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { RedocModule, RedocOptions } from 'nestjs-redoc';

/**
 * 
 * @param app Aplicação base para geração da documentação
 * @result `/api` para HTTP, e para .json `/api-json`
 * 
 * TODO - Aterar |app: any| para |app: INestApplication|
 * Import: import { INestApplication } from '@nestjs/common';
 */
export function enableOpenApi(app: any) {
    const config = new DocumentBuilder()
        .setTitle('API TimerDoc')
        .setDescription('API TimerDoc')
        .addTag('Authentication', 'Autenticação no sistema.')
        .addTag('Users', 'Usuarios do sistema.')
        .addTag('Company', 'Empresas clientes, utilizadoras do TimerDoc.')
        .addTag('Plans', 'Planos que empresas clientes podem utilizar no sistema.')
        .addTag('Checkers', 'End-points que iram verificar o status atual da aplicação.')
        .addBearerAuth(
            {
                description: 'Default JWT Authorization',
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        )
        .setVersion(process.env.VERSION || '0.0.1')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    if (process.env.NODE_ENV !== "prod")
        SwaggerModule.setup('api', app, document);

    const redocOptions: RedocOptions = {
        title: 'API TimerDoc',
        logo: {
            url: 'https://timerdoc.com.br/TD-FULL-V1-FIT-WO-BG.png',
            backgroundColor: '#F0F0F0',
            altText: 'TimerDoc logo'
        },
        sortPropsAlphabetically: true,
        hideDownloadButton: false,
        hideHostname: false
    };
    if (process.env.NODE_ENV !== "prod")
        RedocModule.setup('/api-new', app, document, redocOptions);
}