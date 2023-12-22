import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from '@security/auth.controller';
import { AuthService } from '@security/auth.service';
import { jwtConstants } from '@security/constants';
import { LocalStrategy } from '@security/local.strategy';
import { EmailModule } from 'src/resources/email/email.module';
import { SharedModule } from 'src/resources/shared/shared.module';

@Module({
  imports: [
    PassportModule,
    SharedModule,
    EmailModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.tmpExpiration },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy],
})
export class AuthModule { }
