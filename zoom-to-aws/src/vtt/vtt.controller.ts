import { Controller, Get, Query } from '@nestjs/common';
import { VttService } from './vtt.service';

@Controller('vtt')
export class VttController {
    constructor(private readonly vttService: VttService) {}

    @Get('download')
    async downloadVTTFiles(
        @Query('userId') userId: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate:string,
        @Query('userName') userName?: string,
    ) {
        await this.vttService.downloadVTTFilesForUser(userId, startDate, endDate, userName);
        return 'VTT files located (check console for logged paths)'; 
    }
}
