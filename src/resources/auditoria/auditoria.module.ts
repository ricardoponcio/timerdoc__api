import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuditoriaService } from './auditoria.service';
import { Auditoria } from './entities/auditoria.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([Auditoria]),
  ],
  controllers: [],
  providers: [AuditoriaService],
  exports: [AuditoriaService]
})
export class AuditoriaModule { }