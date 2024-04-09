import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Role } from "../../roles/entities/role.entity";
import mongoose, { HydratedDocument } from "mongoose";

export type PermissionsDocument = HydratedDocument<Permissions>
@Schema({timestamps : true})
export class Permission{
    @Prop({type : mongoose.Schema.Types.ObjectId, ref : 'Role'})
    role_id : Role[];

    @Prop({required : true})
    route : string;

    @Prop({required : false, default : ''})
    description : string;

    @Prop({required : true})
    method : string;

    @Prop({type : 'boolean', required : true, default : false})
    protected : boolean
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

