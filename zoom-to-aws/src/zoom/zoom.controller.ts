import { Controller, Get, Query } from '@nestjs/common';
import { ZoomService } from './zoom.service';

function validateDateFormat(dateStr: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(dateStr);
}
@Controller('zoom')
export class ZoomController {
    constructor(private readonly zoomService: ZoomService){}
    //1. Collect Users Data
    @Get('update-users')
    async update_users(): Promise<any>{
        await this.zoomService.updateUsers()
        return {message: "Updating Users Data."}
        
    }
    //2. Collect Users Recordings Data Functions
    @Get('collect-legacy-data')
    async collect_legacy_data(): Promise<any>{
        return await this.zoomService.collectLegacyData()
    }
    //Specify Dates: http://localhost:3000/zoom/collect-weekly-data?start_date=2021-05-01&end_date=2021-05-08
    //Most Recent Week: http://localhost:3000/zoom/collect-weekly-data
    @Get('collect-weekly-data')
    async collect_weekly_data(@Query('start_date') startDate?: string, @Query('end_date') endDate?: string): Promise<any>{
        if(!startDate || !endDate){
            this.zoomService.collectWeeklyData()
            return {message: "Data Collection from Zoom's api initiated. Recording files saved in api_data/weekly_recordings"}
        }

        if (!validateDateFormat(startDate) || !validateDateFormat(endDate)){
            return {message: "start_date and end_date parameters should be in YYYY-MM-DD format."}
        }

        await this.zoomService.collectWeeklyData(startDate, endDate);
        return {message: `Data collection from Zoom's api initiated. Recording files will be named ${startDate} to ${endDate}.json and can be found in the api_data/weekly_data directory for each user.`}
    }
    //3. Batch Functions
    //http://localhost:3000/zoom/batch-transfer-legacy-data?start_date=2021-12-01&end_date=2021-12-31
    @Get('batch-transfer-legacy-data')
    async legacyDataBatchTransfer(@Query('start_date') startDate?: string, @Query('end_date') endDate?: string): Promise<any>{
        if (!startDate || !endDate || !validateDateFormat(startDate) || !validateDateFormat(endDate)){
            return {message: "start_date and end_date parameters are required for transferring legacy data, and should be in YYYY-MM-DD format."}
        }
        return {message: `Data Migration Initiated for Recording Files named: ${startDate} to ${endDate}.json`}
        await this.zoomService.batchLegacyDataTransfer(startDate, endDate)
    }

    @Get('batch-transfer-weekly-data')
    async weeklyDataBatchTransfer(@Query('start_date') startDate?: string, @Query('end_date') endDate?:string): Promise<any>{
        if(!startDate || !endDate){
            await this.zoomService.batchWeeklyDataTransfer()
            return {message: "Data Migration Initiated for Last Week's Recording Files"}
        }

        if (!validateDateFormat(startDate) || !validateDateFormat(endDate)) {
            return {message: "start_date and end_date parameters should be in YYYY-MM-DD format"};
        }

        await this.zoomService.batchWeeklyDataTransfer(startDate, endDate)
        return {message: `Data Migration Initiated for Recording Files named: ${startDate} to ${endDate}.json`}
    }
    
}
