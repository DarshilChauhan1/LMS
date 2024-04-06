import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class GoogleLogin{
    @IsNotEmpty()
    @IsString()
    username : string

    @IsNotEmpty()
    @IsEmail()
    email : string;
}