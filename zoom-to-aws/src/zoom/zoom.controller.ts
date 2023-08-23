import { Controller, Get } from '@nestjs/common';
import { ZoomService } from './zoom.service';

@Controller('zoom')
export class ZoomController {
    constructor(private readonly zoomService: ZoomService){}

    @Get('update-users')
    async update_users(): Promise<any>{
        return await this.zoomService.updateUsers()
    }
}
