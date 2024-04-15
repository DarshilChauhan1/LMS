import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, ObjectId } from "mongoose";
import { TestEnum } from "../enums/test.enum";


export type TestDocument = HydratedDocument<Test>

@Schema({timestamps : true})
export class Test {
    @Prop({enum : TestEnum, required : true})
    name : string;

    @Prop({required : true})
    description : string;

    @Prop()
    questions : string[]

    @Prop()
    answers : string[]

    @Prop({required : false})
    test_total_marks : number

    @Prop()
    user_obtained_mark : number;

    @Prop({type : Date, required : false})
    time_taken : Date

    @Prop({type : [{type : mongoose.Schema.Types.ObjectId}], ref : 'Book', required : true})
    book_id : mongoose.Schema.Types.ObjectId[]

    @Prop({type : mongoose.Schema.Types.ObjectId, ref : 'User', required : true})
    student_id : mongoose.Schema.Types.ObjectId

    @Prop({required : false, type : 'boolean', default : false})
    submitted : boolean
}

export const TestSchema = SchemaFactory.createForClass(Test);