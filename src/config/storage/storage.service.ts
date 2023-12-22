import { BufferedFile } from '@storage/storage.interfaces';
import { StorageErrors } from '@app/core/constants/definition/errors/11xx.storage.errors';
import { GenericException } from '@app/core/exceptions/generic.exception';
import { Empresa } from '@app/resources/shared/empresas/entities/empresa.entity';
import { Usuario } from '@app/resources/shared/usuarios/entities/usuario.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as crypto from 'crypto';
import { MinioService } from 'nestjs-minio-client/dist/module';
import internal from 'stream';
import { UserCompanyPayload } from '../security/auth/user-company.payload.dto';
import { UserPayload } from '../security/auth/user.payload.dto';
import { ArmazenamentoAcaoDetailDto } from './dto/armazenamento-acao-detail.dto';
import { AcaoEnum, ArmazenamentoAcao, TipoArquivoEnum } from './entities/armazenamento-acao.entity';

export interface UploadedStorageFile {
  url: string,
  path: string,
  bucket: string
}

@Injectable()
export class MinIOService {

  private readonly bucketName = this.__getBucketName();

  constructor(
    private readonly minio: MinioService,
    @InjectModel(ArmazenamentoAcao)
    private repository: typeof ArmazenamentoAcao) { }

  public get client() {
    return this.minio.client;
  }

  // ============= Generic Methods Company/User

  private async __validateCompanyFileAccess(detalheAcao: ArmazenamentoAcaoDetailDto, company: UserCompanyPayload, bucketNameOverride?: string): Promise<string> {
    if (!detalheAcao || !(detalheAcao.origem instanceof Empresa))
      throw GenericException.fromConstant(StorageErrors.ERRO_SALVAR_METODO_INCORRETO);
    const bucketName = bucketNameOverride || this.__getBucketNameByLoggedCompany(company);
    if (!await this.client.bucketExists(bucketName))
      await this.client.makeBucket(bucketName, this.__getRegion());
    return bucketName;
  }

  private async __validateUserFileAccess(detalheAcao: ArmazenamentoAcaoDetailDto, user: UserPayload, bucketNameOverride?: string): Promise<string> {
    if (!detalheAcao || !(detalheAcao.origem instanceof Usuario))
      throw GenericException.fromConstant(StorageErrors.ERRO_SALVAR_METODO_INCORRETO);
    const bucketName = bucketNameOverride || this.__getBucketNameByLoggedUser(user);
    if (!await this.client.bucketExists(bucketName))
      await this.client.makeBucket(bucketName, this.__getRegion());
    return bucketName;
  }

  // ============= Upload Methods Company/User

  public async uploadCompanyFile(file: BufferedFile, folder: string = '', detalheAcao: ArmazenamentoAcaoDetailDto, company: UserCompanyPayload): Promise<UploadedStorageFile> {
    const bucketName = await this.__validateCompanyFileAccess(detalheAcao, company);
    return this.__upload(file, this.__addPrefixFolderSharedBucket(folder, detalheAcao), detalheAcao, bucketName);
  }

  public async uploadUserFile(file: BufferedFile, folder: string = '', detalheAcao: ArmazenamentoAcaoDetailDto, user: UserPayload): Promise<UploadedStorageFile> {
    const bucketName = await this.__validateUserFileAccess(detalheAcao, user);
    return this.__upload(file, this.__addPrefixFolderSharedBucket(folder, detalheAcao), detalheAcao, bucketName);
  }

  private async __upload(file: BufferedFile, folder: string = '', detalheAcao?: ArmazenamentoAcaoDetailDto, bucketName: string = this.bucketName): Promise<UploadedStorageFile> {
    const timestamp = Date.now().toString();
    const hashedFileName = crypto
      .createHash('md5')
      .update(timestamp)
      .digest('hex');
    const extension = file.originalname.substring(
      file.originalname.lastIndexOf('.'),
      file.originalname.length,
    );
    const metaData = {
      'Content-Type': file.mimetype,
    };

    // We need to append the extension at the end otherwise Minio will save it as a generic file
    const fileName = hashedFileName + extension;

    const folderPath = folder.split('/').filter(f => !!f).join('/');
    const fullPath = `${folderPath}${folderPath && folderPath.trim() !== '' ? '/' : ''}${fileName}`;

    const uploaded = await this.client.putObject(
      bucketName,
      fullPath,
      file.buffer,
      file.size,
      metaData
    );

    if (detalheAcao) {
      this.__addStorageAction(AcaoEnum.Create, detalheAcao.tipoArquivo, fullPath, bucketName, file, detalheAcao.origem);
    }

    return {
      url: `${this.__resolvePreffixURL(bucketName)}${fullPath}`,
      path: fullPath,
      bucket: bucketName
    };
  }

  // ============= Download Methods Company/User

  public async downloadCompanyFile(objetName: string, bucketName: string, detalheAcao: ArmazenamentoAcaoDetailDto, company: UserCompanyPayload): Promise<internal.Readable> {
    const finalBucketName = await this.__validateCompanyFileAccess(detalheAcao, company, bucketName);
    return this.__download(objetName, detalheAcao, finalBucketName);
  }

  public async downloadUserFile(objetName: string, bucketName: string, detalheAcao: ArmazenamentoAcaoDetailDto, user: UserPayload): Promise<internal.Readable> {
    const finalBucketName = await this.__validateUserFileAccess(detalheAcao, user, bucketName);
    return this.__download(objetName, detalheAcao, finalBucketName);
  }

  private async __download(objetName: string, detalheAcao?: ArmazenamentoAcaoDetailDto, bucketName: string = this.bucketName): Promise<internal.Readable> {
    const downloadResult = await this.client.getObject(bucketName, objetName);
    if (detalheAcao) {
      const storageCreateAction = await this.__findStorageAction(AcaoEnum.Create, detalheAcao.tipoArquivo, bucketName, objetName);
      if (storageCreateAction) this.__addStorageActionFromAnother(AcaoEnum.Download, storageCreateAction);
    }
    return downloadResult;
  }

  // ============= Delete Methods Company/User

  public async deleteCompanyFile(objetName: string, bucketName: string, detalheAcao: ArmazenamentoAcaoDetailDto, company: UserCompanyPayload): Promise<void> {
    const finalBucketName = await this.__validateCompanyFileAccess(detalheAcao, company, bucketName);
    return this.__delete(objetName, detalheAcao, finalBucketName);
  }

  public async deleteUserFile(objetName: string, bucketName: string, detalheAcao: ArmazenamentoAcaoDetailDto, user: UserPayload): Promise<void> {
    const finalBucketName = await this.__validateUserFileAccess(detalheAcao, user, bucketName);
    return this.__delete(objetName, detalheAcao, finalBucketName);
  }

  private async __delete(objetName: string, detalheAcao?: ArmazenamentoAcaoDetailDto, bucketName: string = this.bucketName): Promise<void> {
    const deleteResult = await this.client.removeObject(bucketName, objetName);
    if (detalheAcao) {
      const storageCreateAction = await this.__findStorageAction(AcaoEnum.Create, detalheAcao.tipoArquivo, bucketName, objetName);
      if (storageCreateAction) this.__addStorageActionFromAnother(AcaoEnum.Delete, storageCreateAction);
    }
    return deleteResult;
  }

  // ============= General Public Utils Methods

  public async searchStorageUsedFromOrigin(origem: Usuario | Empresa) {
    const [results, metadata] = await this.repository.sequelize.query(`
    select sum(
      case when acao = 'CREATE' then tamanho
      when acao = 'DELETE' then (-1 * tamanho)
      else 0 end
    )
    from armazenamento_acao 
    where ${origem instanceof Empresa ? 'empresa_id' : 'usuario_id'} = ${origem.id};
    `);
    return (<any>results[0]).sum;
  }

  public checkExistsFile(file: BufferedFile, origem: Usuario | Empresa) {
    const md5 = this.__md5FromFile(file);
    return this.repository.findAll({
      where: {
        md5,
        ...(origem instanceof Usuario ? { usuarioId: origem.id } : {}),
        ...(origem instanceof Empresa ? { empresaId: origem.id } : {})
      }
    });
  }

  public async checkExistsFiles(files: BufferedFile[], origem: Usuario | Empresa): Promise<{ file: BufferedFile, registros: ArmazenamentoAcao[] }[]> {
    const arquivosJaSalvos = await Promise.all(files?.map(async f => {
      const arquivoJaSalvo = await this.checkExistsFile(f, origem);
      return {
        file: f,
        registros: arquivoJaSalvo
      }
    }));
    return arquivosJaSalvos.filter(f => !!f.registros);
  }

  // ============= General Private Utils Methods

  private __md5FromFile(file: BufferedFile) {
    return crypto.createHash("md5").update(file.buffer).digest("hex");
  }

  private __resolvePreffixURL = (bucketName: string) => {
    const port = process.env.STORAGE_PORT == '80' || process.env.STORAGE_PORT == '443' ? '' : `:${process.env.STORAGE_PORT}`;
    return `${process.env.STORAGE_PROTOCOL}://${process.env.STORAGE_URL}${port}/${bucketName}/`;
  }

  private __addStorageAction(acao: AcaoEnum, tipoArquivo: TipoArquivoEnum, caminhoS3: string, bucket: string, file: BufferedFile, origem: Usuario | Empresa) {
    try {
      const acaoRegister = new ArmazenamentoAcao();
      acaoRegister.data = new Date();
      acaoRegister.acao = acao;
      acaoRegister.tipo = tipoArquivo;
      acaoRegister.caminhoS3 = caminhoS3;
      acaoRegister.bucket = bucket;
      acaoRegister.tamanho = BigInt(file.size);
      acaoRegister.md5 = this.__md5FromFile(file);
      acaoRegister.usuarioId = origem instanceof Usuario ? origem.id : undefined;
      acaoRegister.empresaId = origem instanceof Empresa ? origem.id : undefined;
      acaoRegister.save();
    } catch (err) {

    }
  }

  private __addStorageActionFromAnother(acao: AcaoEnum, acaoRegisterOrgin: ArmazenamentoAcao) {
    try {
      const acaoRegister = new ArmazenamentoAcao();
      acaoRegister.data = new Date();
      acaoRegister.acao = acao;
      acaoRegister.tipo = acaoRegisterOrgin.tipo;
      acaoRegister.caminhoS3 = acaoRegisterOrgin.caminhoS3;
      acaoRegister.bucket = acaoRegisterOrgin.bucket;
      acaoRegister.tamanho = acaoRegisterOrgin.tamanho;
      acaoRegister.md5 = acaoRegisterOrgin.md5;
      acaoRegister.usuarioId = acaoRegisterOrgin.usuarioId;
      acaoRegister.empresaId = acaoRegisterOrgin.empresaId;
      acaoRegister.save();
    } catch (err) {

    }
  }

  private __findStorageAction(acao: AcaoEnum, tipoArquivo: TipoArquivoEnum, bucket: string, caminhoS3: string) {
    return this.repository.findOne({
      where: {
        acao, tipo: tipoArquivo,
        bucket, caminhoS3
      }
    });
  }

  private __getBucketName() {
    // switch (process.env.NODE_ENV) {
    //   case "":
    //     return process.env.STORAGE_BUCKET_DEV;
    //   case "desenv":
    //     return process.env.STORAGE_BUCKET_HML;
    //   case "prod":
    //     return process.env.STORAGE_BUCKET_PRD;
    //   default:
    //     return process.env.STORAGE_BUCKET_DEV;
    // }
    return process.env.STORAGE_BUCKET;
  }

  private __addPrefixFolderSharedBucket(folder: string, detalheAcao: ArmazenamentoAcaoDetailDto): string {
    if (!this.__isBucketPerItemId()) {
      const prefix = detalheAcao.origem instanceof Usuario ? `/user/${detalheAcao.origem.id}` :
        detalheAcao.origem instanceof Empresa ? `/company/${detalheAcao.origem.id}` : null;
      if (!prefix) throw GenericException.fromConstant(StorageErrors.ERRO_SALVAR_METODO_INCORRETO);
      return folder.includes(prefix) ? folder : `${prefix}/${folder}`;
    }
    return folder;
  }

  private __getBucketNameByLoggedCompany(company?: UserCompanyPayload): string {
    if (this.__isBucketPerItemId()) {
      const empresaId = company?.sub?.empresaId;
      if (!empresaId) throw GenericException.fromConstant(StorageErrors.ERRO_SALVAR_ARQUIVO_FALTA_EMPRESA);
      return `timerdoc-${process.env.NODE_ENV || 'dev'}-company-${empresaId}`;
    }
    return this.bucketName;
  }

  private __getBucketNameByLoggedUser(user?: UserPayload): string {
    if (this.__isBucketPerItemId()) {
      const userId = user?.id;
      if (!userId) throw GenericException.fromConstant(StorageErrors.ERRO_SALVAR_ARQUIVO_FALTA_USUARIO);
      return `timerdoc-${process.env.NODE_ENV || 'dev'}-user-${userId}`;
    }
    return this.bucketName;
  }

  private __getRegion(): string {
    return process.env.STORAGE_REGION || 'us-east-1';
  }

  private __isBucketPerItemId(): boolean {
    return process.env.STORAGE_BUCKET_GROUP_ID.toLowerCase() === 'true';
  }

}
