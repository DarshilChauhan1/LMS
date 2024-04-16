import { forwardRef, Module } from '@nestjs/common';
import { DataseedService } from './dataseed.service';
import { DataseedController } from './dataseed.controller';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from 'src/roles/entities/role.entity';
import { RolesModule } from 'src/roles/roles.module';
import { PermissionSchema } from 'src/permissions/entities/permission.entity';
import { AppService } from 'src/app.service';
import { AppModule } from 'src/app.module';
import { DiscoveryModule } from '@nestjs/core';
import { Router } from 'express';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { RoutesService } from './dataseed.interceptor';

@Module({
  imports : [MongooseModule.forFeature([{name : Role.name, schema : RoleSchema}, {name : 'Permission', schema : PermissionSchema}]),RolesModule, forwardRef(() => AppModule), JwtModule, ConfigModule.forRoot(), DiscoveryModule],
  controllers: [DataseedController],
  providers: [DataseedService, AppService, RoutesService],
})
export class DataseedModule {}
