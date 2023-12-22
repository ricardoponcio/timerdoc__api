import { Auditoria, AuditoriaOperacaoEnum } from '@app/resources/auditoria/entities/auditoria.entity';
import { DocumentoGeralAlertaExcecao } from '@app/resources/documento/documento-geral-alerta-excecao/entities/documento-geral-alerta-excecao.entity';
import { DocumentoGeralAlerta } from '@app/resources/documento/documento-geral-alerta/entities/documento-geral-alerta.entity';
import { DocumentoGeral } from '@app/resources/documento/documento-geral/entities/documento-geral.entity';
import { DocumentoRecorrenteAnexo } from '@app/resources/documento/documento-recorrente-anexo/entities/documento-recorrente-anexo.entity';
import { DocumentoRecorrenteObservacao } from '@app/resources/documento/documento-recorrente-observacao/entities/documento-recorrente-observacao.entity';
import { DocumentoRecorrente } from '@app/resources/documento/documento-recorrente/entities/documento-recorrente.entity';
import { Empresa } from '@app/resources/shared/empresas/entities/empresa.entity';
import { Plano } from '@app/resources/shared/planos/plano.entity';
import { Role } from '@app/resources/shared/role/entity/role.entity';
import { UsuarioEmpresaConvite } from '@app/resources/shared/usuario-empresa/entities/usuario-empresa-convite.entity';
import { UsuarioHashRecuperacao } from '@app/resources/shared/usuarios/entities/usuario-hash-recuperacao';
import { Usuario } from '@app/resources/shared/usuarios/entities/usuario.entity';
import { MethodNotAllowedException, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserPayload } from '@security/user.payload.dto';
import { UsuarioEmpresa } from 'src/resources/shared/usuario-empresa/entities/usuario-empresa.entity';
import { ArmazenamentoAcao } from '@storage/entities/armazenamento-acao.entity';
import { Variavel } from '@app/resources/variavel/entities/variavel.entity';
import { DocumentoFormulario } from '@app/resources/documento/documento-formulario/entities/documento-formulario.entity';
import { DocumentoGeralAlertaCompetencia } from '@app/resources/documento/documento-geral-alerta/entities/documento-geral-alerta-competencia.entity';
require('dotenv').config();

@Module({
    imports: [
        SequelizeModule.forRoot({
            username: process.env.DB_USER,
            password: process.env.DB_PWD,
            database: process.env.DB_NAME,
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            dialect: 'postgres',
            models: [
                Auditoria,
                Plano,
                Empresa,
                Usuario,
                Role,
                DocumentoGeral,
                DocumentoGeralAlerta,
                DocumentoGeralAlertaCompetencia,
                DocumentoGeralAlertaExcecao,
                DocumentoRecorrente,
                ArmazenamentoAcao,
                DocumentoRecorrenteAnexo,
                DocumentoRecorrenteObservacao,
                DocumentoFormulario,
                UsuarioEmpresa,
                UsuarioEmpresaConvite,
                UsuarioHashRecuperacao,
                Variavel
            ],
            autoLoadModels: false,
            synchronize: true,
            hooks: {
                beforeBulkUpdate: (options) => __saveAudit(AuditoriaOperacaoEnum.UPDATE, options),
                afterUpdate: (instance, options) => __saveAuditPlusModel(AuditoriaOperacaoEnum.UPDATE, instance, options),
                beforeBulkCreate: (options) => __saveAudit(AuditoriaOperacaoEnum.INSERT, options),
                afterCreate: (instance, options) => __saveAuditPlusModel(AuditoriaOperacaoEnum.INSERT, instance, options),
                beforeBulkDestroy: (options) => __saveAudit(AuditoriaOperacaoEnum.DELETE, options),
                afterDestroy: (instance, options) => __saveAuditPlusModel(AuditoriaOperacaoEnum.DELETE, instance, options),
            },
            logging: process.env.NODE_ENV !== 'homolog' && process.env.NODE_ENV !== 'prod' ? console.log : false
        })
    ],
    exports: [SequelizeModule]
})
export class DatabasesModule { }

function __saveAudit(operacao: AuditoriaOperacaoEnum, options: any): import("sequelize/types/hooks").HookReturn {
    throw new MethodNotAllowedException('Não use Bulk Insert/Update/Destroy!');
    __saveAuditPlusModel(operacao, null, options);
}
function __saveAuditPlusModel(operacao: AuditoriaOperacaoEnum, model: any, options: any): import("sequelize/types/hooks").HookReturn {
    if (model instanceof Auditoria) return;
    try {
        const auditoria = new Auditoria();
        auditoria.dataCriacao = new Date();
        auditoria.operacao = operacao;
        auditoria.entidade = model ? JSON.stringify(model.get({ plain: true })) : JSON.stringify(options.attributes);
        auditoria.entityId = model ? model.id : options?.attributes?.id;
        auditoria.userId = model && model.request ? (<UserPayload>model.request.user)?.id : undefined;
        auditoria.tableName = model.constructor?.tableName;
        auditoria.save();
    } catch (err) {
        console.error(err);
    }
}
