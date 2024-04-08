import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { RoleEnum } from "../enum/role.enum";

export type RoleDocument = HydratedDocument<Role>
@Schema({timestamps : true})
export class Role{
    @Prop({ enum : RoleEnum, required : true, default : RoleEnum.USER})
    role : string;

    @Prop({type : mongoose.Schema.Types.ObjectId, ref : 'User'})
    users : mongoose.Schema.Types.ObjectId[]

    @Prop({type : mongoose.Schema.Types.ObjectId, ref : 'Permissions'})
    permissons : mongoose.Schema.Types.ObjectId[];

}

export const RoleSchema = SchemaFactory.createForClass(Role)