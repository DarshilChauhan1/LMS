import { Prop, Schema } from "@nestjs/mongoose";
import mongoose from "mongoose";

@Schema()
export class Book {
    @Prop({required : true, unique : true})
    title: string;

    @Prop({required : true})
    description: string;

    @Prop({required : true})
    author: string

    @Prop({type : mongoose.Schema.Types.ObjectId, ref : 'User'})
    studentId : mongoose.Schema.Types.ObjectId[]

    @Prop({required : true})
    standerd : string
}
