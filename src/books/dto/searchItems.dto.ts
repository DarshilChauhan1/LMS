import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class SearchItemsDto {
    @IsString()
    @ApiProperty()
    search ?: string;

    @IsString()
    @ApiProperty()
    filter ?: string;

    @IsString()
    @ApiProperty()
    order_by ? : string;

    @IsString()
    @ApiProperty()
    page ? : string

    @IsString()
    @ApiProperty()
    limit ? : string

}