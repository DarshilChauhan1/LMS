import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission } from './entities/permission.entity';
import { ResponseBody } from 'src/helpers/helper';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { Role } from 'src/roles/entities/role.entity';
import { RoleEnum } from 'src/roles/enum/role.enum';
import { RequestMethod } from './enums/request.enum';
import { PATH_METADATA } from '@nestjs/common/constants';

@Injectable()
export class PermissionsService {
    constructor(
        private readonly reflectorService: Reflector,
        private readonly discoveryService: DiscoveryService,
        private readonly metadataScanner: MetadataScanner,
        @InjectModel('Role') private roleModel: Model<Role>,
        @InjectModel('Permission') private permissionModel: Model<Permission>) { }


    async addPermissions() {
        try {
            const getExistingPermissions = await this.permissionModel.find().select('route method ');
            const routes = this.getRoutes();
            console.log("routes--->", routes)
            const uniqueRoutes = this.addUniquePermissions(getExistingPermissions, routes);
            const getAdminRole = await this.roleModel.findOne({ role: RoleEnum.SCHOOL_ADMIN });
            // store permissions into DB
            for (const route of uniqueRoutes) {
                const permissionObj = {
                    route: route['path'],
                    method: RequestMethod[route['method']],
                    role_id: getAdminRole._id,
                    protected: route['protected'] == 'AuthGuardJWT' ? true : false
                }
                console.log(permissionObj)
                await this.permissionModel.create(permissionObj);
            }
            return new ResponseBody(200, 'Permissions added successfully', undefined, true);
        } catch (error) {
            throw error
        }
    }

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

    async updatePermission(id: number, payload: UpdatePermissionDto) {
        try {
            const { role_id } = payload;
            const findPermission = await this.permissionModel.findById(id);
            if (!findPermission) throw new NotFoundException('No such Permission found');
            if (role_id && role_id.length > 0) {
                let updatedRoles = findPermission.role_id.filter((role) => !role_id.includes(role.toString()));
                findPermission.role_id = updatedRoles;
            }
            // check if there is protected in the payload
            payload.protected ? (findPermission.protected == payload.protected ? findPermission.protected : findPermission.protected = payload.protected) : findPermission.protected;


            await findPermission.save();
            return new ResponseBody(200, 'Permission updated successfully', findPermission, true);

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
    private addRolesInPermission(currentRoles: any[], role_id: any[]) {
        let updatedRole = currentRoles
        for (const role of role_id) {
            if (currentRoles.find((currentRole) => currentRole.toString() === role) == undefined) {
                updatedRole.push(role);
            }
        }
        return updatedRole;
    }

    private addUniquePermissions(currentPermissions: any[], newPermissions: any[]) {
        let updatedPermissions = [];
        for (const permission of newPermissions) {
            if (currentPermissions.find((currentPermission) => currentPermission['route'] === permission['path'] && currentPermission['method'] === RequestMethod[permission['method']])) continue;
            updatedPermissions.push(permission);
        }
        return updatedPermissions
    }


    // method to get all the routes with their methods and guards
    private getRoutes() {
        const routes = [];
        const controllers = this.discoveryService.getControllers();
        for (const wrapper of controllers) {
            const { instance } = wrapper;
            const prototype = Object.getPrototypeOf(instance);
            const keys = Object.getOwnPropertyNames(prototype);
            const controllerName = this.reflectorService.get(PATH_METADATA, instance['constructor']);
            // this will get the constructor instance of controller if there is any common guard
            let getCommonAuthInstance = this.reflectorService.get('__guards__', instance['constructor']);

            // if there is a common guard then we will use that guard for all the routes
            if (getCommonAuthInstance != undefined) {
                for (const key of keys) {
                    const routePath: string = Reflect.getMetadata('path', instance[key]);
                    const routeMethod: number = Reflect.getMetadata('method', instance[key]);
                    if (routePath && routeMethod >= 0) {
                        routes.push({
                            path: `${controllerName}/${routePath}`,
                            method: routeMethod,
                            protected: getCommonAuthInstance[0].name
                        });
                    }
                }
            } else {
                for (const key of keys) {
                    const routePath: string = Reflect.getMetadata('path', instance[key]);
                    const routeMethod: number = Reflect.getMetadata('method', instance[key]);
                    const guardName = this.reflectorService.get('__guards__', instance[key]);
                    if (routePath && routeMethod >= 0) {
                        routes.push({
                            path: `${controllerName}/${routePath}`,
                            method: routeMethod,
                            protected: guardName != undefined ? guardName[0].name : ""
                        });
                    }
                }
            }
        }
        return routes;
    }
}




