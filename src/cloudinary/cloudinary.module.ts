import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryController } from './cloudinary.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports : [ConfigModule.forRoot()],
  controllers: [CloudinaryController],
  providers: [CloudinaryService],
  exports : [CloudinaryService]
})
export class CloudinaryModule {}
