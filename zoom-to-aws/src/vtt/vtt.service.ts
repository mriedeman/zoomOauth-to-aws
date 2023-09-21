import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { exists, existsSync, mkdirSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { AuthService } from 'src/auth/auth.service';
import { firstValueFrom } from 'rxjs';
import { writeFileSync } from 'fs';

@Injectable()
export class VttService {

    constructor(private authService: AuthService,
                private httpService: HttpService){}

    async downloadVTTFilesForDateRange(start_date: string, end_date: string) {
        const recordingDirectory = './api_data/legacy_recordings_data';
        console.log(readdirSync(recordingDirectory));
        for (const userFolder of readdirSync(recordingDirectory)) {
            const path = join(recordingDirectory, userFolder);

            if (existsSync(path)) {
                for (const fileName of readdirSync(path)) {
                    if (fileName.startsWith(start_date) && fileName.endsWith(`${end_date}.json`)) {
                        const filePath = join(path, fileName);
                        const [firstName, lastName, userId] = userFolder.split(" ");
                        console.log(`FILE PATH: ${filePath}`);
                        // Do whatever you want with the filePath (like downloading or processing the file)
                        this.downloadVTTFiles(filePath, firstName, lastName, userId)
                    }
                }
            }
        }
    }

    async downloadVTTFiles(jsonFilePath: any, firstName: string, lastName: string, userId){
        const jsonData = JSON.parse(readFileSync(jsonFilePath, 'utf-8'))
        for (const meeting of jsonData.meetings) {
            console.log(`CHECKING FOR VTT IN MEETING: ${meeting.id}`);
            for (const recordingFile of meeting.recording_files) {

                if (recordingFile.file_type === "TRANSCRIPT" && recordingFile.file_extension === "VTT"){

                    const downloadUrl = recordingFile.download_url;
                    const date = new Date(recordingFile.recording_start);
                    const timestampString = date.toISOString().replace(/:/g, '-').split('.')[0];
                    const filename = `${timestampString}`;
                    const fileExtension = recordingFile.file_extension.toLowerCase();

                    const token = await this.authService.getAccessToken()

                    let response: AxiosResponse | null = null;

                    try {
                        response = await firstValueFrom(this.httpService.get(`${downloadUrl}?access_token=${token}`, {
                            responseType: 'arraybuffer'
                        }));
                    } catch (error) {
                        console.error('Error fetching VTT file:', error);
                    }
                    
                    if (response && response.data) {
                        console.log(`RECEIVED DATA OF LENGTH: ${response.data.length}`);
                        const directory = `./api_data/legacy_transcripts/${firstName} ${lastName} ${userId}`;
                        try {
                            if (!existsSync(directory)) {
                                mkdirSync(directory, { recursive: true });
                            }
                        } catch (error) {
                            console.error('Error creating directories:', error);
                        }
                    
                        const savePath = join(directory, `${filename}.${fileExtension}`);
                        console.log(savePath);
                        try {
                            writeFileSync(savePath, response.data);
                            console.log(`Successfully Saved file: ${filename}`);
                        } catch (error) {
                            console.error('Error saving the file:', error);
                        }
                    }
                }
            }
        }
    }
}
                   
                    
                    
               
        
    


