import { Injectable} from '@nestjs/common';
import {HttpService} from '@nestjs/axios'
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';
import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync} from 'fs';
import { join } from 'path';
import * as AWS from 'aws-sdk';
@Injectable()
export class ZoomService {
    private readonly baseUrl: string = 'https://api.zoom.us/v2';
    private accessToken: string; //Call Oauth Service to populate this value

    //aws creds
    s3 = new AWS.S3({
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY')
    });

    constructor(private httpService: HttpService,
                private authService: AuthService,
                private readonly configService: ConfigService){}
    
    //=================COLLECT ALL USER INFO REQUIRED TO RETRIEVE DOWNLOAD_URLS=================
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
    //=================RETRIEVE DOWNLOAD_URLS FOR BOTH LEGACY DATA AND WEEKLY DATA TRANSFERS=================
    getPreviousWeekDates(): [string, string] {
        // Get current date and subtract 7 days to get the date one week ago
        const today = new Date();
        today.setDate(today.getDate() - 7);
        
        // Calculate the start of the previous week (Monday)
        const start_date = new Date(today);
        start_date.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); //getDay() returns 0 for Sunday
        
        // Calculate the end of the previous week (Sunday)
        const end_date = new Date(start_date);
        end_date.setDate(start_date.getDate() + 6);
        
        // Format dates as YYYY-MM-DD
        const formatDate = (date: Date): string => {
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');  // January is 0!
            const dd = String(date.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
        };
        
        return [formatDate(start_date), formatDate(end_date)];
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

                const directory = `./api_data/legacy_recordings_data/${userFirstName} ${userLastName} ${userId}`;
                if (!existsSync(directory)) {
                    mkdirSync(directory, {recursive: true})
                }

                const filename = `${directory}/${start} to ${end}.json`;
                writeFileSync(filename,JSON.stringify(recordingsData));
                console.log(`Successfully Saved file: ${filename}`);

            }
        }
    }

    async collectWeeklyData(start_date?: string, end_date?: string) {
        if (!start_date || !end_date) {
            [start_date, end_date] = this.getPreviousWeekDates();
        }

        const users = JSON.parse(readFileSync('./api_data/users/users.json', 'utf8'));

        for (const user of users.users) {
            const userFirstName = user.first_name;
            const userLastName = user.last_name;
            const userId = user.id;

            const now = new Date();
            if (new Date(end_date) > now) break;

            const token = await this.authService.getAccessToken();
            const headers = { 'Authorization': `Bearer ${token}` };
            const params = { from: start_date, to: end_date };

            let response = await firstValueFrom(this.httpService.get(`${this.baseUrl}/users/${userId}/recordings`, { headers, params }));
            let recordingsData = response.data;

            let nextPageToken = recordingsData.next_page_token;
            while (nextPageToken) {
                const nextPageParams = { ...params, next_page_token: nextPageToken };
                response = await firstValueFrom(this.httpService.get(`${this.baseUrl}/users/${userId}/recordings`, { headers, params: nextPageParams }));
                
                const nextPageData = response.data;
                recordingsData.meetings = recordingsData.meetings.concat(nextPageData.meetings);
                if (nextPageToken === nextPageData.next_page_token) break;

                nextPageToken = nextPageData.next_page_token;
            }

            const directory = `./api_data/weekly_recordings/${userFirstName} ${userLastName} ${userId}`;
            if (!existsSync(directory)) {
                mkdirSync(directory, { recursive: true });
            }

            const filename = `${directory}/${start_date} to ${end_date}.json`;
            writeFileSync(filename, JSON.stringify(recordingsData));
            console.log(`Successfully Saved file: ${filename}`);
        }

        console.log(`DATA COLLECTION COMPLETE AT ${new Date()}`);
    }

    //=================USE DOWNLOAD_URLS TO MIGRATE MP4 VIDEOS AND THEIR TRANSCRIPTS TO AWS=================

    async uploadFileToS3(downloadUrl: string, filename: string, firstName: string, lastName: string, fileExtension: string) {
        const token = this.authService.getAccessToken()
        const response: AxiosResponse = await firstValueFrom(this.httpService.get(`${downloadUrl}?access_token=${token}`, {
            responseType: 'arraybuffer'
        }));
    
        const s3ObjectKey = `${firstName}_${lastName}/${filename}.${fileExtension}`;
    
        await this.s3.putObject({
            Bucket: this.configService.get<string>('S3_BUCKET_NAME'),
            Key: s3ObjectKey,
            Body: response.data
        }).promise();
    
        console.log(`${filename} uploaded successfully to S3 in folder ${firstName}_${lastName} with object key: ${s3ObjectKey}.`);
    }
    
    async migrateFilesToAWS(jsonData: any, firstName: string, lastName: string, userId: string) {
        for (const meeting of jsonData.meetings) {
            for (const recording of meeting.recording_files) {
                if (recording.file_type === "MP4" && recording.file_size > 20 * 1024 * 1024) {
    
                    // Upload the MP4 file
                    const downloadUrl = recording.download_url;
                    const date = new Date(recording.recording_start);
                    const timestampString = date.toISOString().replace(/:/g, '-').split('.')[0];
                    const filename = `${firstName} ${lastName} ${userId} ${timestampString}`;
    
                    const fileExtension = recording.file_extension.toLowerCase();
                    await this.uploadFileToS3(downloadUrl, filename, firstName, lastName, fileExtension);
    
                    // Find and upload the associated transcript
                    const transcript = meeting.recording_files.find(r => r.file_type === "TRANSCRIPT" && r.recording_start === recording.recording_start);
                    if (transcript) {
                        const transcriptDownloadUrl = transcript.download_url;
                        const transcriptExtension = transcript.file_extension.toLowerCase();
                        await this.uploadFileToS3(transcriptDownloadUrl, filename, firstName, lastName, transcriptExtension);
                    }
                }
            }
        }
    }

    //=================Batch Functions=================

    async batchLegacyDataTransfer(start_date: string, end_date: string){
        const recordingDirectory = './api_data/legacy_recordings_data';
        await this.batchDataTransfer(recordingDirectory, start_date, end_date)
    }

    async batchWeeklyDataTransfer(start_date?: string, end_date?: string) {
        if (!start_date || !end_date) {
            [start_date, end_date] = this.getPreviousWeekDates();
        }
        const recordingDirectory = './api_data/weekly_recordings';
        await this.batchDataTransfer(recordingDirectory, start_date, end_date);
    }

    private async batchDataTransfer(recordingDirectory: string, start_date: string, end_date: string) {
        if (!existsSync(recordingDirectory)) {
            console.error(`Directory ${recordingDirectory} does not exist.`);
            return;
        }

        for (const userFolder of readdirSync(recordingDirectory)) {
            const path = join(recordingDirectory, userFolder);
            if (existsSync(path)) {
                for (const fileName of readdirSync(path)) {
                    if (fileName.startsWith(start_date) && fileName.endsWith(`${end_date}.json`)) {
                        const filePath = join(recordingDirectory, userFolder, fileName);
                        const [firstName, lastName, userId] = userFolder.split(" ");
                        console.log(filePath);
                        // await this.migrateFilesToAWS(
                        //     JSON.parse(readFileSync(filePath, 'utf-8')),
                        //     firstName,
                        //     lastName,
                        //     userId
                        // );
                    }
                }
            }
        }
    }
}


