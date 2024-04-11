import { ConfigModule, ConfigService } from "@nestjs/config";
import { MulterModuleAsyncOptions } from "@nestjs/platform-express";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { diskStorage } from "multer";
import { extname } from "node:path/win32";

export const MulterConfigAsync : MulterModuleAsyncOptions = {
    imports: [ConfigModule.forRoot()],
    useFactory: async (configService: ConfigService) => ({
      dest: configService.get<string>('MULTER_DEST'),
    }),
    inject: [ConfigService],
}

export const MulterCustomOptions : MulterOptions= {
    storage : diskStorage({
        destination : process.env.MULTER_DEST,
        filename : (req, file, cb) => {
            const suffix = Date.now()
            const prefix = file.originalname
            const ext = extname(file.originalname)
            const filename = `${prefix}-${suffix}${ext}`;
            return cb(null, filename);
        }
    })

}