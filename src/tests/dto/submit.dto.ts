import { ApiProperty } from "@nestjs/swagger"
import { TestEnum } from "../enums/test.enum"
import { IsDate, IsString } from "class-validator"

export class SubmitDto{
    @ApiProperty()
    test : TestEnum

    @IsString()
    @ApiProperty()
    marks : string

    @IsString()
    @ApiProperty()
    totalMarks : number

    @IsDate()
    @ApiProperty()
    timeTaken : Date
}