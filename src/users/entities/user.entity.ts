import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Role } from "../../roles/entities/role.entity";
import { PlatformEnum } from "../enum/platform.enum";

export type UserDocument = HydratedDocument<User>;

@Schema({timestamps : true})
export class User {

    @Prop({unique : true, trim : true, required : true})
    username : string;

    @Prop({unique : true, trim : true, required : true})
    email : string;

    @Prop({ select : false})
    password : string;

    @Prop({required : true, enum : PlatformEnum, default : PlatformEnum.APPLICATION})
    platform_field : string

    @Prop({type : mongoose.Schema.Types.ObjectId, ref : 'Role' })
    role_id : Role;

    @Prop({type : [{type : mongoose.Schema.Types.ObjectId}], ref : 'Book'})
    books : mongoose.Schema.Types.ObjectId[]

    @Prop({type : 'boolean', default : false})
    isActive :  boolean

    @Prop({type : [{type : mongoose.Schema.Types.ObjectId}], ref : 'Assignment'})
    assignments : mongoose.Schema.Types.ObjectId[]

    @Prop()
    refreshToken : string;

    @Prop({required : false})
    forgotPasswordToken : string;

    @Prop({required : false, type : Date})
    forgotPasswordExpiry : Date

    @Prop({required : false, default : false})
    isDeleted : boolean
    
}

export const UserSchema = SchemaFactory.createForClass(User);
