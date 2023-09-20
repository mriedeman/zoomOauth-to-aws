import { Injectable } from '@nestjs/common';
import { exists, existsSync, readdirSync } from 'fs';
import { join } from 'path';

@Injectable()
export class VttService {

    async downloadVTTFilesForUser(userId: string, start_date: string, end_date: string, userName?: string) {
        const recordingDirectory = './api_data/legacy_recordings_data';
        const userFolder = this.findUserFolder(recordingDirectory, userId, userName)
        console.log(userFolder);
    
        if (userFolder) {
            const path = join(recordingDirectory, userFolder);
            for (const filename of readdirSync(path)) {
                const filepath = join(path, filename);
                console.log(filepath);
            }
        }
    }
    

    // private findUserFolder(directory: string, userId: string, userName?: string): string | null {
    //     if (!existsSync(directory)) {
    //         console.error(`Directory ${directory} does not exist.`);
    //         return null;
    //     }
    
    //     for (const userFolder of readdirSync(directory)) {
    //         const path = join(directory, userFolder);
    //         if (existsSync(path)) {
    //             const [firstName, lastName, folderUserId] = userFolder.split(" ");
    //             const fullName = `${firstName} ${lastName}`;
    //             if (folderUserId === userId || fullName === userName) {
    //                 return userFolder;
    //             }
    //         }
    //     }
    //     console.error(`User folder for ${userId} or ${userName} not found`);
    //     return null;
    // }

    private findUserFolder(directory: string, userId: string, userName?: string): string | null {
        if (!existsSync(directory)) {
            console.error(`Directory ${directory} does not exist.`);
            return null;
        }
    
        // First, try to find a folder that matches the userId exactly
        for (const userFolder of readdirSync(directory)) {
            const path = join(directory, userFolder);
            if (existsSync(path)) {
                const folderDetails = userFolder.split(" ");
                const folderUserId = folderDetails.slice(2).join(" ");
                if (folderUserId === userId) {
                    return userFolder;
                }
            }
        }
    
        // If no folder matched the userId, then try to find a folder that matches the userName
        if (userName) {
            for (const userFolder of readdirSync(directory)) {
                const path = join(directory, userFolder);
                if (existsSync(path)) {
                    const folderDetails = userFolder.split(" ");
                    const fullName = folderDetails.slice(0, 2).join(" ");
                    if (fullName === userName) {
                        return userFolder;
                    }
                }
            }
        }
    
        console.error(`User folder for ${userId} or ${userName} not found`);
        return null;
    }
    
}
