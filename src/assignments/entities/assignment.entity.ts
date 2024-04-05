import { Prop, Schema } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { User } from "src/users/entities/user.entity";

@Schema()
export class Assignment {
    @Prop({required : true})
    title : string;

    @Prop({required : true})
    description : string;

    //Todo Assign Task on basis of book or student
    @Prop({type : mongoose.Schema.Types.ObjectId})
    student_id : User

    @Prop({type : Date})
    due_date : Date

    // one assignment can have one submissions
    @Prop({type : mongoose.Schema.Types.ObjectId, ref : 'AssignmentSubmission'})
    submission_id : mongoose.Schema.Types.ObjectId
}
