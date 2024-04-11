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

    @Prop({type : [{type : mongoose.Schema.Types.ObjectId}], ref : 'User'})
    studentId : mongoose.Schema.Types.ObjectId[]

    @Prop({required : true})
    standard : string

    @Prop({required : true, type : 'boolean', default : false})
    isDeleted : boolean
    
    @Prop({required : true, type : Object})
    pdf : {
        public_id : string,
        url : string
    }
}

export const BookSchema = SchemaFactory.createForClass(Book);
