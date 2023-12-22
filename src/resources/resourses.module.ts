import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailModule } from '@resources/email/email.module';
import { ScheduledTasksService } from '@resources/shedulers/scheduled-tasks.service';
import { SharedModule } from 'src/resources/shared/shared.module';
import { DocumentoModule } from './documento/documento.module';
import { VariavelModule } from './variavel/variavel.module';

@Module({
  imports: [
    SharedModule,
    EmailModule,
    DocumentoModule,
    VariavelModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [],
  providers: [ScheduledTasksService],
})
export class ResoursesModule { }
