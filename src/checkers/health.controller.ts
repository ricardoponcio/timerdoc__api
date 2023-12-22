import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkipAuth } from 'src/utils/decorators/public.decorator';
import { ResponseHealthcheckDto } from 'src/utils/resources/entities/ResponseHealthcheck.dto';

@ApiTags('Checkers')
@SkipAuth()
@Controller('healthcheck')
export class HealthController {

    @ApiResponse({ status: 200, type: ResponseHealthcheckDto, description: 'Casos de sucesso, aplicação ON' })
    @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
    @Get()
    health() {
        return {
            status: true
        };
    }
}
