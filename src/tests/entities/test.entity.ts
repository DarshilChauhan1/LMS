import { Prop, Schema } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { Book } from "src/books/entities/book.entity";
import { TestEnum } from "../enums/test.enum";

@Schema()
export class Test {
    @Prop({type : 'enum', enum : TestEnum, required : true})
    name : string;

    @Prop({required : true})
    description : string;

    @Prop()
    questions : string[]

    @Prop()
    answers : string[]

    @Prop({required : true})
    test_total_marks : number

    @Prop()
    user_obtained_mark : number;

    @Prop({type : Date, required : false})
    time_taken : Date

    @Prop({type : mongoose.Schema.Types.ObjectId, ref : 'Book', required : true})
    book_id : Book

    @Prop({type : mongoose.Schema.Types.ObjectId, ref : 'User', required : true})
    user_id : mongoose.Schema.Types.ObjectId
}
