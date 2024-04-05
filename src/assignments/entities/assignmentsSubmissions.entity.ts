import { Prop, Schema } from "@nestjs/mongoose";
import mongoose from "mongoose";

@Schema()
export class AssignmentSubmissions{
    @Prop({type : 'Object'})
    submissionFile : {
        public_id : string,
        url : string
    }

    @Prop({type : mongoose.Schema.Types.ObjectId, ref : 'User'})
    student_id : string;

    @Prop({type : 'boolean', default : false})
    isSubmitted : boolean
}
