import { Controller, Get, Query } from '@nestjs/common';
import { ZoomService } from './zoom.service';

@Controller('zoom')
export class ZoomController {
    constructor(private readonly zoomService: ZoomService){}
    //1.
    @Get('update-users')
    async update_users(): Promise<any>{
        return await this.zoomService.updateUsers()
    }
    //2.
    @Get('collect-legacy-data')
    async collect_legacy_data(): Promise<any>{
        return await this.zoomService.collectLegacyData()
    }
    //Specify Dates: http://localhost:3000/zoom/collect-weekly-data?start_date=2021-05-01&end_date=2021-05-08
    //Most Recent Week: http://localhost:3000/zoom/collect-weekly-data
    @Get('collect-weekly-data')
    async collect_weekly_data(@Query('start_date') startDate?: string, @Query('end_date') endDate?: string): Promise<any>{
        await this.zoomService.collectWeeklyData(startDate, endDate);
        return {message: 'Data Collection Initiated'}
    }
    //3.
    
}
