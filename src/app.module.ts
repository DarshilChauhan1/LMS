import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseAsyncConfig } from './common/config/mongoose.config';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { BooksModule } from './books/books.module';
import { AssignmentsModule } from './assignments/assignments.module';

@Module({
  imports: [AuthModule, ConfigModule.forRoot(), MongooseModule.forRootAsync(MongooseAsyncConfig), UsersModule, BooksModule, AssignmentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
