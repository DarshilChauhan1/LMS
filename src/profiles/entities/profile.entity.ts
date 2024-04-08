import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, mongo } from "mongoose";


export type ProfileDocument = HydratedDocument<Profile>
@Schema({timestamps : true})
export class Profile {
    @Prop({required : true})
    firstname : string;

    @Prop()
    lastname : string;

    @Prop({required : true})
    standard : string;

    @Prop({type : 'Object',required : false, default : {public_id : '', url : ''}})
    avatar : {
        public_id : string,
        url : string
    }

    @Prop({type : mongoose.Schema.Types.ObjectId, ref : 'User'})
    student_id : mongoose.Schema.Types.ObjectId
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);