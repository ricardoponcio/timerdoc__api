import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Variavel } from './entities/variavel.entity';
import { VariavelController } from './variavel.controller';
import { VariavelService } from './variavel.service';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Variavel]),
    SharedModule
  ],
  controllers: [VariavelController],
  providers: [VariavelService],
  exports: [VariavelService],
})
export class VariavelModule { }
