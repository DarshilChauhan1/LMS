import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CloudinaryService {
    constructor(private readonly configService: ConfigService) {
        cloudinary.config({
            api_key: this.configService.get('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
            cloud_name: this.configService.get('CLOUDINARY_NAME')
        })
    }

    async uploadImage(filePath: any): Promise<UploadApiResponse | UploadApiErrorResponse> {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload(filePath, { folder: "LMS BOOKS", allowed_formats: ['pdf', 'jpg'] }, (error, result) => {
                if (error) {
                    reject(error);
                }
                resolve(result);
            })
        })
    }

    async downloadPdf(publicId) {
        try {

            // const { url, format, folder } = await cloudinary.api.resource(publicId);
            // console.log(url);
            const filename = 'Banner Report.pdf'
            // const response = await axios.default.get(url, { responseType: 'stream' });
            const tempFolderPath = 'temp';

            if (!fs.existsSync(tempFolderPath)) {
                fs.mkdirSync(tempFolderPath);
            }

            const filePath = path.join(tempFolderPath, filename);

            // WILL SEND BUFFER DATA TO THE FUNCTION IN stream
            const stream = fs.createReadStream(filePath);
            let data = Buffer.alloc(0);
            return new Promise((resolve, reject) => {
                stream.on('data', (chunk : Buffer) => {
                    data = Buffer.concat([data, chunk]);
                });
                stream.on('end', () => {
                    resolve(data);
                });
                stream.on('error', (error) => {
                    reject(error);
                });
            })

            // Create a writable stream to save the file
            const fileStream = fs.createWriteStream(filePath);

            // Pipe the response stream from Axios to the file stream
            // response.data.pipe(fileStream);

            // Handle events for the file stream
            fileStream.on('finish', () => {
                return this.processPdf(filePath);    
            });

            fileStream.on('error', (err) => {
                console.error('Error downloading file:', err);
            });
        } catch (error) {
            console.error('Error downloading PDF:', error);
            throw error; // Re-throw for handling in calling code
        }
    }

    async processPdf(filePath: string) {
       const stream = fs.createReadStream(filePath, 'utf8');
       let data = "";
       return new Promise((resolve, reject) => {
              stream.on('data', (chunk) => {
                data += chunk;
              });
              stream.on('end', () => {
                resolve(data);
              });
              stream.on('error', (error) => {
                reject(error);
              });
       })

    }

}
