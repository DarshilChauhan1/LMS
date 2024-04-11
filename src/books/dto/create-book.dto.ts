import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateBookDto {

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    title: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    description: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    author: string;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    standard: string;
}
