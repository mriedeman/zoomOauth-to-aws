import { Injectable} from '@nestjs/common';
import {HttpService} from '@nestjs/axios'
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

import { AuthService } from 'src/auth/auth.service';

import { existsSync, mkdirSync, writeFileSync } from 'fs';
@Injectable()
export class ZoomService {
    private readonly baseUrl: string = 'https://api.zoom.us/v2';
    private accessToken: string; //Call Oauth Service to populate this value

    constructor(private httpService: HttpService,
                private authService: AuthService){}

    async updateUsers(): Promise<any> {
        try {
            const token = await this.authService.getAccessToken();

            //httpService returns an observable, so rxjs firstValueFrom function converts it to a promise so we can await it
            const response: AxiosResponse = await firstValueFrom(this.httpService.get(`${this.baseUrl}/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }));

            const data = JSON.stringify(response.data)
            const directory = 'api_data/users'
            const filename = `${directory}/users.json`;
            try {
                if (!existsSync(directory)){
                    mkdirSync(directory, { recursive: true });
                }
            } catch (error) {
                console.error('Error creating directories:', error);
            }

            try {
                writeFileSync(filename, data);

            } catch(error) {
                console.error("Error creating file 'users.json':", error)
            }

            console.log(`Updated the ${filename} to include any new users on ${new Date().toISOString()}`);
            return data
    
        } catch (error) {
            console.error('Error fetching users:', error)
        }
    }
}
