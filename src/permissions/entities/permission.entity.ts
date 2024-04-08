import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Role } from "../../roles/entities/role.entity";
import mongoose, { HydratedDocument } from "mongoose";

export type PermissionsDocument = HydratedDocument<Permissions>
@Schema({timestamps : true})
export class Permission{
    @Prop({type : mongoose.Schema.Types.ObjectId, ref : 'Role'})
    role_id : Role;

    @Prop({required : true})
    routes : string
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

