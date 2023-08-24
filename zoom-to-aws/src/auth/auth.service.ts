import { Injectable} from '@nestjs/common';
import {HttpService} from '@nestjs/axios'
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    private readonly tokenUrl: string = 'https://zoom.us/oauth/token';
    private accessToken: string;

    constructor(private httpService: HttpService,
                private readonly configService: ConfigService) {}

    async getAccessToken(): Promise<string> {
        if (!this.accessToken) {
            await this.fetchAccessToken();
        }
        //console.log(this.accessToken);
        return this.accessToken;
    }

    private async fetchAccessToken(): Promise<void> {


        const clientID = this.configService.get<string>('CLIENT_ID')
        const clientSecret = this.configService.get<string>('CLIENT_SECRET')
        const accountID = this.configService.get<string>('ACCOUNT_ID')
      
        const authHeader = Buffer.from(`${clientID}:${clientSecret}`).toString('base64');

        try {
            const response: AxiosResponse = await firstValueFrom(
                this.httpService.post(this.tokenUrl, null, {
                    params: {
                        grant_type: 'account_credentials',
                        account_id: accountID,
                    },
                    headers: {
                        'Authorization': `Basic ${authHeader}`
                    }
                })
            );

            this.accessToken = response.data.access_token;
        } catch (error) {
            console.error('Error fetching access token:', error);
        }
    }
}