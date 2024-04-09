import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type BookDocument = HydratedDocument<Book>
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
    standard : string
}

export const BookSchema = SchemaFactory.createForClass(Book);
