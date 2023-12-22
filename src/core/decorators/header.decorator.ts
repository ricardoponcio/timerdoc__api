import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IncomingMessage } from 'http';

export const Header = createParamDecorator((name: string, ctx: ExecutionContext): string | undefined => {
    const req = ctx.switchToHttp().getRequest<IncomingMessage>();
    const { headers } = req;

    return headers[name] as string;
});