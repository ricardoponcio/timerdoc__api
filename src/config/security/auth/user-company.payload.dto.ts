export class UserCompanyPayload {
    id !: number;
    email !: string;
    sub: {
        empresaId: number;
    };
}