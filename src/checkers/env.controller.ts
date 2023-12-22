import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkipAuth } from 'src/utils/decorators/public.decorator';
import { ResponseEnvDto } from 'src/utils/resources/entities/ResponseEnv.dto';

@ApiTags('Checkers')
@SkipAuth()
@Controller('env')
export class EnvController {

    @ApiResponse({ status: 200, type: ResponseEnvDto, description: 'Variaveis em prod ou homolog do sistema. Caso esteja rodando local sem export de variaveis de ambiente para NODE_ENV e VERSION o obj retornado será vazio.' })
    @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
    @Get()
    testEnv() {
        return {
            env: process.env.NODE_ENV,
            version: process.env.VERSION
        };
    }

}
