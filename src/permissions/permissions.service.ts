import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, mongo, ObjectId } from 'mongoose';
import { Permission } from './entities/permission.entity';
import { ResponseBody } from 'src/helpers/helper';

@Injectable()
export class PermissionsService {
    constructor(@InjectModel('Permission') private permissionModel: Model<Permission>) { }

    async getAllPermissions() {
        try {
            const permissions = await this.permissionModel.find().populate('role_id');
            return new ResponseBody(200, 'All Permissions', permissions, true);
        } catch (error) {
            throw error;
        }
    }

    async addPermissionToRoute(payload: CreatePermissionDto) {
        try {
            const { role_id, route, method } = payload;
            if (role_id.length > 0 && route && method) {
                const findPermission = await this.permissionModel.findOne({ route, method }).select('role_id');
                console.log(findPermission);
                if (!findPermission) throw new NotFoundException('No such Permission found');

                let updatedRoles = this.addRolesInPermission(findPermission.role_id, role_id);
                findPermission.role_id = updatedRoles;
                await findPermission.save();

                return new ResponseBody(200, 'Permission added successfully', undefined, true);
            } else {
                throw new BadRequestException('All fields are required');
            }
        } catch (error) {
            throw error
        }
    }

    async removeRoles(id: number, payload: UpdatePermissionDto) {
        try {
            const { role_id } = payload;
            const findPermission = await this.permissionModel.findById(id).select('role_id');
            if (!findPermission) throw new NotFoundException('No such Permission found');
            let updatedRoles = findPermission.role_id.filter((role) => !role_id.includes(role.toString()));
            findPermission.role_id = updatedRoles;
            await findPermission.save();
            return new ResponseBody(200, 'Permission updated successfully', undefined, true);

        } catch (error) {
            throw error;
        }
    }

    async deletePermission(id: string) {
        try {
            const permission = await this.permissionModel.findByIdAndDelete(id);
            if (!permission) throw new NotFoundException('No such Permission found');
            return new ResponseBody(200, 'Permission deleted successfully', undefined, true);
        } catch (error) {
            throw error;
        }
    }



    //Method to attach all unique roles to a permission
    private addRolesInPermission(currentRoles: ObjectId[], role_id: any[]) {
        let updatedRole = currentRoles
        for (const role of role_id) {
           if(currentRoles.find((currentRole) => currentRole.toString() === role) == undefined){
                updatedRole.push(role);
           }
        }
        return updatedRole;
    }
}
