import { Module } from '@nestjs/common';
import { DataseedService } from './dataseed.service';
import { DataseedController } from './dataseed.controller';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from 'src/roles/entities/role.entity';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports : [MongooseModule.forFeature([{name : Role.name, schema : RoleSchema}]),RolesModule],
  controllers: [DataseedController],
  providers: [DataseedService],
})
export class DataseedModule {}
