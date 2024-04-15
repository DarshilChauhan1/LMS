import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class QueryDto{
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    search ?: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    filter ?: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    order_by ? : string;

    @IsNumber()
    @IsString()
    @ApiProperty()
    page : string

    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    limit ? : string

}