import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { BookSchema } from './entities/book.entity';
import { PermissionSchema } from 'src/permissions/entities/permission.entity';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { UserSchema } from 'src/users/entities/user.entity';
import { MulterModule } from '@nestjs/platform-express';
import { MulterConfigAsync } from 'src/common/config/multer.config';
import { ProfileSchema } from 'src/profiles/entities/profile.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Book', schema: BookSchema }, { name: 'Permission', schema: PermissionSchema }, 
  { name: 'User', schema: UserSchema }, {name : 'Profile', schema : ProfileSchema}]), PermissionsModule, JwtModule, ConfigModule.forRoot(), AuthModule, CloudinaryModule, 
  MulterModule.registerAsync(MulterConfigAsync)],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule { }
