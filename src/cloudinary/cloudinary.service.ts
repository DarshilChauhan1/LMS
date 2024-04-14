import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse} from 'cloudinary';
import * as axios from 'axios';

@Injectable()
export class CloudinaryService {
    constructor(private readonly configService: ConfigService) {
        cloudinary.config({
            api_key : this.configService.get('CLOUDINARY_API_KEY'),
            api_secret : this.configService.get('CLOUDINARY_API_SECRET'),
            cloud_name : this.configService.get('CLOUDINARY_NAME')
        })
    }

    async uploadImage(filePath: any)  : Promise<UploadApiResponse | UploadApiErrorResponse> { 
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload(filePath, {folder : "LMS BOOKS", allowed_formats : ['pdf', 'jpg'] }, (error, result) => {
                if(error) {
                    reject(error);
                }
                resolve(result);
            })
        })
    }

    async downloadPdf(public_id: string) {
        try {
          const result = await cloudinary.api.resource(public_id, { resource_type: 'raw' });
          console.log(result);
        } catch (error) {
            console.log(error)
        }
    }

}
