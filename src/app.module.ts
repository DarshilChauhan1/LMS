import {  Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseAsyncConfig } from './common/config/mongoose.config';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { BooksModule } from './books/books.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { ProfilesModule } from './profiles/profiles.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { DataseedModule } from './dataseed/dataseed.module';
import { AppService } from './app.service';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { TestsModule } from './tests/tests.module';
import { CrontasksModule } from './crontasks/crontasks.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DiscoveryModule, DiscoveryService } from '@nestjs/core';

@Module({
  imports: [AuthModule, ConfigModule.forRoot(), MongooseModule.forRootAsync(MongooseAsyncConfig), UsersModule, BooksModule, AssignmentsModule, ProfilesModule, RolesModule, PermissionsModule, DataseedModule, CloudinaryModule, TestsModule, CrontasksModule, ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}


