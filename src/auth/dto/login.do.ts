import { IsNotEmpty, IsString } from "class-validator";

export class LoginDto{
    @IsNotEmpty()
    @IsString()
    username : string;

    @IsNotEmpty()
    @IsString()
    password : string

    @IsNotEmpty()
    @IsString()
    platform_field : string
}