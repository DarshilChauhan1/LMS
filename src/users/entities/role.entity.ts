import { Prop, Schema } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { RoleEnum } from "../enum/role.enum";

@Schema({timestamps : true})
export class Role{
    @Prop({type : 'enum', enum : RoleEnum, required : true, default : RoleEnum.USER})
    role : string;

    @Prop({type : mongoose.Schema.Types.ObjectId, ref : 'User'})
    users : mongoose.Schema.Types.ObjectId[]

    @Prop({type : mongoose.Schema.Types.ObjectId, ref : 'Permissions'})
    permissons : mongoose.Schema.Types.ObjectId[];

}