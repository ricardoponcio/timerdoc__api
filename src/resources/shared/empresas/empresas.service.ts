import { BufferedFile } from '@storage/storage.interfaces';
import { MinIOService } from '@storage/storage.service';
import { Role, RolesEnum } from '@app/resources/shared/role/entity/role.entity';
import { TokenUtils } from '@app/utils/token.utils';
import { Injectable, MethodNotAllowedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { UserCompanyPayload } from '@security/user-company.payload.dto';
import { UpdateEmpresaDto } from '@shared/empresas/dto/update-empresa.dto';
import { Empresa } from '@shared/empresas/entities/empresa.entity';
import { Plano, PlanosEnum } from '@shared/planos/plano.entity';
import { PlanosService } from '@shared/planos/planos.service';
import { RoleService } from '@shared/role/role.service';
import { UsuarioEmpresaService } from '@shared/usuario-empresa/usuario-empresa.service';
import { Usuario } from '@shared/usuarios/entities/usuario.entity';
import { UsuariosService } from '@shared/usuarios/usuarios.service';
import { Includeable } from 'sequelize/types/model';
import { UserPayload } from 'src/config/security/auth/user.payload.dto';
const _ = require('lodash');

@Injectable()
export class EmpresasService {
  constructor(
    @InjectModel(Empresa)
    private repository: typeof Empresa,
    private readonly usuarioService: UsuariosService,
    private readonly usuarioEmpresaService: UsuarioEmpresaService,
    private readonly planosService: PlanosService,
    private readonly roleService: RoleService,
    private readonly jwtService: JwtService,
    private readonly minioService: MinIOService
  ) { }

  async create(empresa: Empresa): Promise<Empresa> {
    // return this.repository.create(empresa);
    const plano = await this.planosService.findByName(PlanosEnum.BASICO);
    empresa.planoId = plano.id;
    return empresa.save();
  }

  async createAndLinkUser(empresa: Empresa, user: Usuario | UserPayload): Promise<Empresa> {
    const newCompany = await this.create(empresa);
    await this.usuarioEmpresaService.linkUserAndCompany(user, newCompany);
    const ue = await this.usuarioEmpresaService.findByEmpresaIdAndUserId(user.id, newCompany.id);
    return _.pick(ue[0], ['role', 'empresa']);
  }

  async findAll(where?: Partial<Empresa>) {
    return await this.repository.findAll({
      where: { ...where },
      include: [
        {
          model: Usuario,
          as: 'usuarios',
        },
      ],
    });
  }

  findById(id: number, include?: Includeable[]) {
    return this.repository.findByPk(id, {
      include: include,
      plain: true,
    });
  }

  findByCpnj(cnpj: string) {
    return this.repository.findOne({ where: { cnpj: cnpj } });
  }

  update(id: number, updateEmpresaDto: UpdateEmpresaDto) {
    return this.repository.findByPk(id)
      .then(empresa => empresa.update(updateEmpresaDto));
  }

  remove(id: number, usuarioLogado: UserPayload) {
    return this.repository.findByPk(id)
      .then(async empresa => {
        await this.usuarioEmpresaService.deleteAllFromCompany(new Empresa({ id }), usuarioLogado);
        return empresa;
      })
      .then(empresa => empresa.destroy());
  }

  async loginWithCompany(id: number, user: UserPayload) {
    const company = await this.findById(id, [Plano]);
    if (!company) throw new Error(`Company@${id} not found!`);
    const userDB = await this.usuarioService.findById(user.id);
    if (!userDB) throw new Error(`User@${user.id} not found!`);
    return this.usuarioService.generateTokenBody(TokenUtils.buildCompanyPayload(userDB, company),
      TokenUtils.convertCompanySecureValue(company));
  }

  async companyAndPlansValidation(companyInRequest: UserCompanyPayload, plansNeeded: PlanosEnum[]): Promise<boolean> {
    const selectedCompany = await this.findById(companyInRequest.sub.empresaId, [Plano]);
    const planosFilter = await Promise.all(plansNeeded.map(async p => await this.planosService.findByName(p)));
    if (!planosFilter || planosFilter.length === 0) {
      throw new MethodNotAllowedException('Falha interna! Plano de filtro de funcionalidade não existe!');
    } else {
      const matchPlans = planosFilter.filter(p => selectedCompany.planoId !== p.id && selectedCompany.plano.ordem <= p.ordem);
      if (!matchPlans || matchPlans.length === 0)
        throw new MethodNotAllowedException('Roles vinculados ao Usuário/Empresa não contempla a funcionalidade solicitada!');
    }
    return true;
  }

  async userAndRolesValidation(companyInRequest: UserCompanyPayload, rolesNeeded: RolesEnum[]): Promise<boolean> {
    const usuarioEmpresa = await this.usuarioEmpresaService.findByEmpresaIdAndUserId(companyInRequest.id, companyInRequest.sub.empresaId);
    const roles = usuarioEmpresa.map(ue => ue.role);
    const rolesFilter = await Promise.all(rolesNeeded.map(async role => await this.roleService.findByName(role)));
    if (!rolesFilter || rolesFilter.length === 0) {
      throw new MethodNotAllowedException('Falha interna! Roles de filtros de funcionalidade não existe!');
    } else {
      const matchRoles = roles.filter(r => rolesFilter.some(rf => rf.id === r.id) || rolesFilter.some(rf => r.ordem < rf.ordem));
      if (!matchRoles || matchRoles.length === 0)
        throw new MethodNotAllowedException('Roles vinculados ao Usuário/Empresa não contempla a funcionalidade solicitada!');
    }
    return true;
  }

  async compareRoles(roleBase: Role | Role[] | string, roleComparada: Role | string): Promise<number> {
    const roleBaseObj = Array.isArray(roleBase) ? roleBase : roleBase instanceof Role ? [roleBase] : [await this.roleService.findByName(roleBase)];
    const roleComparadaObj = roleComparada instanceof Role ? roleComparada : await this.roleService.findByName(roleComparada);
    if (!roleBaseObj || !roleComparadaObj) throw new Error('Roles são nulas e não permitem comparação!');

    const maxBaseOrdem = Math.max.apply(Math, roleBaseObj.map(rb => rb.ordem));;
    if (maxBaseOrdem < roleComparadaObj.ordem) return 1;
    else if (maxBaseOrdem > roleComparadaObj.ordem) return -1;
    else return 0;
  }

  async maxUploadMBStoragePerCompany(user: UserCompanyPayload): Promise<number> {
    const empresa = await this.findById(user.sub.empresaId, [Plano]);
    const plano = empresa.plano;

    if (plano.nome === PlanosEnum.BASICO) return 500;
    else if (plano.nome === PlanosEnum.SIMPLES) return 1024;
    else if (plano.nome === PlanosEnum.COMPLETO) return 3096;
    else return 0;
  }

  async supportUploadSize(file: BufferedFile | BufferedFile[], user: UserCompanyPayload): Promise<boolean> {
    const empresa = await this.findById(user.sub.empresaId);

    const usage = await this.minioService.searchStorageUsedFromOrigin(empresa);
    const usageMB = usage / 1024 / 1024;
    const newFileMB = (Array.isArray(file) ? file.reduce((acc, f) => acc + f.size, 0) : file.size) / 1024 / 1024;
    const newUsageMB = usageMB + newFileMB;

    return newUsageMB < await this.maxUploadMBStoragePerCompany(user);
  }

  async filesExceedMaxSizePerUpload(file: BufferedFile | BufferedFile[], user: UserCompanyPayload): Promise<BufferedFile[]> {
    const empresa = await this.findById(user.sub.empresaId, [Plano]);
    const plano = empresa.plano;

    let tamanhoMaximoArquivoMb = 0;
    if (plano.nome === PlanosEnum.BASICO) tamanhoMaximoArquivoMb = 5;
    else if (plano.nome === PlanosEnum.SIMPLES) tamanhoMaximoArquivoMb = 50;
    else if (plano.nome === PlanosEnum.COMPLETO) tamanhoMaximoArquivoMb = 100;

    return (Array.isArray(file) ? file : [file]).filter(f => (f.size / 1024 / 1024) > tamanhoMaximoArquivoMb);
  }

}
