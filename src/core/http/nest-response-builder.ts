import { NestResponse } from "./nest-response";

export class NestResponseBuilder {
    private resposta: NestResponse = {
        status: 200,
        headers: {},
        body: {}
    };

    public setStatus(status: number) {
        this.resposta.status = status;
        return this;
    }

    public setHeaders(headers: Object) {
        this.resposta.headers = headers;
        return this;
    }

    public setBody(body: Object) {
        this.resposta.body = body;
        return this;
    }

    public build() {
        return new NestResponse(this.resposta);
    }
}