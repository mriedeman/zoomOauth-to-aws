import { Injectable} from '@nestjs/common';
import {HttpService} from '@nestjs/axios'
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

import { AuthService } from 'src/auth/auth.service';
import { existsSync, mkdirSync, writeFileSync, readFileSync,} from 'fs';
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

    //generate dates to collect legacy data
    legacyDates(): [string, string][] {
        const startDateStr = '2021-01-01';
        const startDate = new Date(startDateStr);
        const now = new Date();
        const dateRanges: [string, string][] = [];

        while (startDate < now) {
            const startOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
            const endOfMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

            dateRanges.push([startOfMonth.toISOString().split('T')[0], endOfMonth.toISOString().split('T')[0]]);

            startDate.setMonth(startDate.getMonth() + 1);

        }
        return dateRanges;
    }

    //fetch and store legacy data containing the desired download_urls
    async collectLegacyData() {
       
        const users = JSON.parse(readFileSync('./api_data/users/users.json', 'utf-8'))
        for (const user of users.users) {
            const userFirstName = user.first_name;
            const userLastName = user.last_name;
            const userId = user.id;
            const token = await this.authService.getAccessToken();
    
            for (const [start, end] of this.legacyDates()) {
                const headers = { 'Authorization': `Bearer ${token}`};
                const params = { from: start, to: end };

                let response = await firstValueFrom(this.httpService.get(`${this.baseUrl}/users/${userId}/recordings`, {headers, params}));
                let recordingsData = response.data;

                let nextPageToken = recordingsData.next_page_token;
                while (nextPageToken) {
                    const nextPageParams = { ...params, next_page_token: nextPageToken};
                    response = await firstValueFrom(this.httpService.get(`${this.baseUrl}/users/${userId}/recordings`, {headers, params: nextPageParams}));
                    const nextPageData = response.data;
                    recordingsData.meetings = recordingsData.meetings.concat(nextPageData.meetings);
                    //if the tokens are the same there is no next page
                    if (nextPageToken === nextPageData.next_page_token) break;

                    nextPageToken = nextPageData.next_page_token;
                }

                const directory = `./api_data/legacy_recordings_data/${userFirstName} ${userLastName}`;
                if (!existsSync(directory)) {
                    mkdirSync(directory, {recursive: true})
                }

                const filename = `${directory}/${start} to ${end}.json`;
                writeFileSync(filename,JSON.stringify(recordingsData));
                console.log(`Successfully Saved file: ${filename}`);

            }
        }
    }
}
