import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Role } from "./role.entity";
import mongoose, { HydratedDocument } from "mongoose";

export type PermissionsDocument = HydratedDocument<Permissions>
@Schema({timestamps : true})
export class Permissions{
    @Prop({type : mongoose.Schema.Types.ObjectId, ref : 'Role'})
    role : Role;

    @Prop({required : true})
    action : string[]

    @Prop({required : true})
    subject : string
}

export const PermissionSchema = SchemaFactory.createForClass(Permissions);

