export class InformacaoDestinatario {
  email: string;
  nome: string;
  hashRecuperacao: string;

  constructor(email: string, nome: string, hashRecuperacao: string) {
    this.email = email;
    this.nome = nome;
    this.hashRecuperacao = hashRecuperacao;
  };
}
