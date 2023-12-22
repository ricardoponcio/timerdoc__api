import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InformacaoDestinatario } from '@resources/email/dto/envio-emails-informacoes.dto';
import { escapeRegExp } from 'lodash';
import { join } from 'path';
import { firstValueFrom } from 'rxjs';
import { InformacaoRemetente } from './dto/envio-emails-informacoes-remetente.dto';
const HtmlCreator = require('html-creator');
import fs = require('fs');

@Injectable()
export class EmailService {
  constructor(private readonly httpService: HttpService) { }

  async __sendEmail(
    destinatarios: InformacaoDestinatario[],
    assunto: string,
    body: string,
  ) {
    return await firstValueFrom(
      this.httpService.post(
        'https://api.sendinblue.com/v3/smtp/email',
        {
          sender: {
            name: 'Suporte Timerdoc',
            email: 'suporte@timerdoc.com.br',
          },
          to: destinatarios?.map((d) => {
            return {
              email: d.email,
              name: d.nome,
            };
          }),
          subject: assunto,
          htmlContent: body,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'api-key': process.env.EMAIL_API_KEY,
          },
        },
      ),
    );
  }

  __loadTemplate(templateName: string, parameters: { key: string, value: string }[]): string {
    let template = fs.readFileSync(join(process.cwd(), `./src/common/templates/${templateName}.html`)).toString();
    for (let parameter of parameters) {
      template = template.replace(new RegExp(escapeRegExp(`\$\{${parameter.key}\}`), 'g'), parameter.value);
    }
    return template;
  }

  __newUserBody(linkFlow: string): string {
    return this.__loadTemplate('novo-cadastro', [
      { key: 'link', value: linkFlow }
    ]);
  }

  __newPasswordBody(linkFlow: string): string {
    return this.__loadTemplate('recuperar-senha', [
      { key: 'link', value: linkFlow }
    ]);
  }

  __newConviteRegistroBody(nomeConvidado: string, nomeRemetente: string, nomeEmpresa: string, linkFlow: string): string {
    return this.__loadTemplate('convite-registro', [
      { key: 'nome', value: nomeConvidado },
      { key: 'remetenteConvite', value: nomeRemetente },
      { key: 'empresa', value: nomeEmpresa },
      { key: 'link', value: linkFlow }
    ]);
  }

  __newConviteBody(nomeConvidado: string, nomeRemetente: string, nomeEmpresa: string, linkFlow: string): string {
    return this.__loadTemplate('convite', [
      { key: 'nome', value: nomeConvidado },
      { key: 'remetenteConvite', value: nomeRemetente },
      { key: 'empresa', value: nomeEmpresa },
      { key: 'link', value: linkFlow }
    ]);
  }

  __newDeleteAccountBody(nomeConvidado: string, linkFlow: string): string {
    return this.__loadTemplate('delete-account', [
      { key: 'nome', value: nomeConvidado },
      { key: 'link', value: linkFlow }
    ]);
  }

  async sendNewUserEmail(destinatario: InformacaoDestinatario) {
    const body = this.__newUserBody(
      `${process.env.BASE_FRONT_URL}/validation/${destinatario.hashRecuperacao}`,
    );
    const result = await this.__sendEmail(
      [destinatario],
      'Verificação de novo cadastro',
      body,
    );
    return result;
  }

  async sendNewPasswordEmail(destinatario: InformacaoDestinatario) {
    const body = this.__newPasswordBody(
      `${process.env.BASE_FRONT_URL}/recover-password/${destinatario.hashRecuperacao}`,
    );
    const result = await this.__sendEmail(
      [destinatario],
      'Recuperar Senha',
      body,
    );
    return result;
  }

  async sendDeleteAccountEmail(destinatario: InformacaoDestinatario) {
    const body = this.__newDeleteAccountBody(
      destinatario.nome,
      `${process.env.BASE_FRONT_URL}/delete-account/${destinatario.hashRecuperacao}`,
    );
    const result = await this.__sendEmail(
      [destinatario],
      'Exclusão da Conta',
      body,
    );
    return result;
  }

  async sendNewInviteEmail(destinatario: InformacaoDestinatario, remetente: InformacaoRemetente, usuarioExistente: boolean) {
    const body = usuarioExistente ?
      this.__newConviteBody(
        destinatario.nome, remetente.nome, remetente.empresa,
        `${process.env.BASE_FRONT_URL}/accept-invite/${destinatario.hashRecuperacao}`,
      ) : this.__newConviteRegistroBody(
        destinatario.nome, remetente.nome, remetente.empresa,
        `${process.env.BASE_FRONT_URL}/complete-register/${destinatario.hashRecuperacao}`,
      );
    const result = await this.__sendEmail(
      [destinatario],
      'Convite de Colaboração',
      body,
    );
    return result;
  }
}
