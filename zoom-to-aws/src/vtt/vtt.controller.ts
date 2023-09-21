import { Controller, Get, Query } from '@nestjs/common';
import { VttService } from './vtt.service';

@Controller('vtt')
export class VttController {
    constructor(private readonly vttService: VttService) {}

    @Get('download')
    async downloadVTTFiles(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate:string,

    ): Promise<any> {
        await this.vttService.downloadVTTFilesForDateRange(startDate, endDate);
        return 'VTT files located (check console for logged paths)'; 
    }
}
