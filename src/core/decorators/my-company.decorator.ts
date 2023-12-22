import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserCompanyPayload } from 'src/config/security/auth/user-company.payload.dto';

export const MyCompany = createParamDecorator(
    (key: string, ctx: ExecutionContext): UserCompanyPayload => {
        const request = ctx.switchToHttp().getRequest();
        return (<UserCompanyPayload>request?.user);
    }
)