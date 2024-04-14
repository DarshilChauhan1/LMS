import { Module } from '@nestjs/common';
import { TestsService } from './tests.service';
import { TestsController } from './tests.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/users/entities/user.entity';
import { TestSchema } from './entities/test.entity';
import { BookSchema } from 'src/books/entities/book.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { PermissionSchema } from 'src/permissions/entities/permission.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports : [MongooseModule.forFeature([{name : 'User', schema : UserSchema}, {name : 'Test', schema : TestSchema}, {name : 'Book', schema : BookSchema}, {name : 'Permission', schema : PermissionSchema}]), JwtModule, ConfigModule.forRoot(), PermissionsModule, CloudinaryModule],
  controllers: [TestsController],
  providers: [TestsService],
})
export class TestsModule {}
