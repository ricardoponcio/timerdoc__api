import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common'
import { UserPayload } from 'src/config/security/auth/user.payload.dto';

export const MyUser = createParamDecorator(
    (key: string, ctx: ExecutionContext): UserPayload => {
        const request = ctx.switchToHttp().getRequest();
        return <UserPayload>request?.user;
    }
)