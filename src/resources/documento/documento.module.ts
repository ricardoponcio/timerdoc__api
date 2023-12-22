import { DocumentoGeralAlerta } from '@app/resources/documento/documento-geral-alerta/entities/documento-geral-alerta.entity';
import { DocumentoGeral } from '@app/resources/documento/documento-geral/entities/documento-geral.entity';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DocumentoGeralAlertaController } from '@resources/documento/documento-geral-alerta/documento-geral-alerta.controller';
import { DocumentoGeralAlertaService } from '@resources/documento/documento-geral-alerta/documento-geral-alerta.service';
import { DocumentoGeralController } from '@resources/documento/documento-geral/documento-geral.controller';
import { DocumentoGeralService } from '@resources/documento/documento-geral/documento-geral.service';
import { MinioClientModule } from '@storage/storage.module';
import { SharedModule } from 'src/resources/shared/shared.module';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { DocumentoGeralAlertaExcecaoController } from './documento-geral-alerta-excecao/documento-geral-alerta-excecao.controller';
import { DocumentoGeralAlertaExcecaoService } from './documento-geral-alerta-excecao/documento-geral-alerta-excecao.service';
import { DocumentoGeralAlertaExcecao } from './documento-geral-alerta-excecao/entities/documento-geral-alerta-excecao.entity';
import { DocumentoRecorrenteAnexoService } from './documento-recorrente-anexo/documento-recorrente-anexo.service';
import { DocumentoRecorrenteAnexo } from './documento-recorrente-anexo/entities/documento-recorrente-anexo.entity';
import { DocumentoRecorrenteObservacaoService } from './documento-recorrente-observacao/documento-recorrente-observacao.service';
import { DocumentoRecorrenteObservacao } from './documento-recorrente-observacao/entities/documento-recorrente-observacao.entity';
import { DocumentoRecorrenteController } from './documento-recorrente/documento-recorrente.controller';
import { DocumentoRecorrenteService } from './documento-recorrente/documento-recorrente.service';
import { DocumentoRecorrente } from './documento-recorrente/entities/documento-recorrente.entity';
import { DocumentoSentinelaService } from './documento-sentinela/documento-sentinela.service';
import { DocumentoFormulario } from './documento-formulario/entities/documento-formulario.entity';
import { DocumentoFormularioController } from './documento-formulario/documento-formulario.controller';
import { DocumentoFormularioService } from './documento-formulario/documento-formulario.service';
import { DocumentoGeralAlertaCompetencia } from './documento-geral-alerta/entities/documento-geral-alerta-competencia.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([DocumentoGeral]),
    SequelizeModule.forFeature([DocumentoGeralAlerta]),
    SequelizeModule.forFeature([DocumentoGeralAlertaCompetencia]),
    SequelizeModule.forFeature([DocumentoGeralAlertaExcecao]),
    SequelizeModule.forFeature([DocumentoRecorrente]),
    SequelizeModule.forFeature([DocumentoRecorrenteAnexo]),
    SequelizeModule.forFeature([DocumentoRecorrenteObservacao]),
    SequelizeModule.forFeature([DocumentoFormulario]),
    MinioClientModule, SharedModule, AuditoriaModule
  ],
  controllers: [
    DocumentoGeralController, DocumentoGeralAlertaController, DocumentoGeralAlertaExcecaoController,
    DocumentoRecorrenteController, DocumentoFormularioController
  ],
  providers: [
    DocumentoGeralService, DocumentoGeralAlertaService, DocumentoGeralAlertaExcecaoService,
    DocumentoRecorrenteService, DocumentoRecorrenteAnexoService, DocumentoRecorrenteObservacaoService,
    DocumentoSentinelaService, DocumentoFormularioService
  ],
  exports: [
    DocumentoGeralService, DocumentoGeralAlertaService, DocumentoGeralAlertaExcecaoService,
    DocumentoRecorrenteService,
    DocumentoSentinelaService, DocumentoFormularioService
  ]
})
export class DocumentoModule { }