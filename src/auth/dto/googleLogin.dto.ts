import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class GoogleLogin{
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    username : string

    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email : string;
}