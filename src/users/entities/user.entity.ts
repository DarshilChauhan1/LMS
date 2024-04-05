import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Role } from "./role.entity";

export type UserDocument = HydratedDocument<User>;

@Schema({timestamps : true})
export class User {
    @Prop()
    name : string

    @Prop({unique : true, trim : true, required : true})
    username : string;

    @Prop({unique : true, trim : true, required : true})
    email : string;

    @Prop({required : true, select : false})
    password : string;

    @Prop({type : mongoose.Schema.Types.ObjectId, ref : 'Role' })
    role : Role;

    @Prop({type : mongoose.Schema.Types.ObjectId, ref : 'Book'})
    books : mongoose.Schema.Types.ObjectId[]

    @Prop({type : 'Object',required : false, default : {public_id : '', url : ''}})
    avatar : {
        public_id : string,
        url : string
    }

    @Prop()
    refreshToken : string;

    @Prop({required : false})
    forgotPasswordToken : string;

    @Prop({required : false, type : Date})
    forgotPasswordExpiry : Date

}

export const UserSchema = SchemaFactory.createForClass(User);
