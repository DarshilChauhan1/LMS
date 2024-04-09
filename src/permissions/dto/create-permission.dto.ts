import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreatePermissionDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    route: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    method: string;

    @IsNotEmpty()
    @ApiProperty()
    role_id: string[];
}
