import { Empresa } from '@app/resources/shared/empresas/entities/empresa.entity';
import { Usuario } from '@app/resources/shared/usuarios/entities/usuario.entity';
import { TipoArquivoEnum } from '../entities/armazenamento-acao.entity';

export class ArmazenamentoAcaoDetailDto {
    tipoArquivo !: TipoArquivoEnum;
    origem !: Usuario | Empresa;
}
