import { MinIOService } from '@storage/storage.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MinioModule } from 'nestjs-minio-client';
import { ArmazenamentoAcao } from './entities/armazenamento-acao.entity';

@Module({
    imports: [
        SequelizeModule.forFeature([ArmazenamentoAcao]),
        MinioModule.registerAsync({
            useFactory: async () => ({
                endPoint: process.env.STORAGE_URL,
                port: parseInt(process.env.STORAGE_PORT),
                useSSL: true,
                accessKey: process.env.STORAGE_ACCESS_KEY,
                secretKey: process.env.STORAGE_SECRET_KEY
            })
        }),
    ],
    providers: [MinIOService],
    exports: [MinIOService],
})
export class MinioClientModule { }