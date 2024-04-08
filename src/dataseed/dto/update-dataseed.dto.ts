import { PartialType } from '@nestjs/mapped-types';
import { CreateDataseedDto } from './create-dataseed.dto';

export class UpdateDataseedDto extends PartialType(CreateDataseedDto) {}
