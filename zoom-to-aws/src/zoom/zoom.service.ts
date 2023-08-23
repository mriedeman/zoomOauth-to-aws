import { Injectable} from '@nestjs/common';
import {HttpService} from '@nestjs/axios'
import { AxiosResponse } from 'axios';
import { writeFileSync } from 'fs';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ZoomService {
    private readonly baseUrl: string = 'https://api.zoom.us/v2';
    private accessToken: string; //Call Oauth Service to populate this value

    constructor(private httpService: HttpService){}

    async updateUsers(): Promise<any> {
        try {
            //httpService returns an observable, so rxjs firstValueFrom function converts it to a promise so we can await it
            const response: AxiosResponse = await firstValueFrom(this.httpService.get(`${this.baseUrl}/users`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            }));

            const filename = '../api_data/users/users.json';
            const data = JSON.stringify(response.data)
            writeFileSync(filename, data);

            console.log(`Updated the ${filename} to include any new users on ${new Date().toISOString()}`);
            return data
        } catch (error) {
            console.error('Error fetching users:', error)
        }
    }
}
