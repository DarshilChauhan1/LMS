import { Module } from '@nestjs/common';
import { CrontasksService } from './crontasks.service';
import { CrontasksController } from './crontasks.controller';
import { TestsModule } from 'src/tests/tests.module';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { PermissionSchema } from 'src/permissions/entities/permission.entity';
import { UserSchema } from 'src/users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { TestSchema } from 'src/tests/entities/test.entity';
import { BookSchema } from 'src/books/entities/book.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { TestsService } from 'src/tests/tests.service';

@Module({
  imports : [MongooseModule.forFeature([{name : 'User', schema : UserSchema}, {name : 'Test', schema : TestSchema}, {name : 'Book', schema : BookSchema}, {name : 'Permission', schema : PermissionSchema}]), JwtModule, ConfigModule.forRoot(), PermissionsModule, CloudinaryModule],
  controllers: [CrontasksController],
  providers: [CrontasksService, TestsService],
})
export class CrontasksModule {}
