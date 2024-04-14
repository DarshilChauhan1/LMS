import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty } from "class-validator";

export class CreateTestDto {
    @IsArray()
    @IsNotEmpty()
    @ApiProperty({type : [String]} )
    book_id: string[];
}
