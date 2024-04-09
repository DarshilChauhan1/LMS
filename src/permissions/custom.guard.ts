import { ForbiddenError } from "@casl/ability";
import { CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Permission } from "src/permissions/entities/permission.entity";
import { User } from "src/users/entities/user.entity";

export class CustomGuard implements CanActivate{
    constructor(
        @InjectModel('User') private userModel : Model<User>,
        @InjectModel('Permission') private permissionModel : Model<Permission>){}
    async canActivate(context: ExecutionContext):   Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const userId = request.user.id;
        const route = request.route.path;
        const method = request.route.stack[0].method;

        console.log(route, method, userId)

        const getUserRole = await this.userModel.findById(userId).select('role_id');

        console.log(getUserRole)

        const permissions = await this.permissionModel.find({role_id : getUserRole.role_id, method : method, route : route});

        console.log(permissions);

        if(!permissions || permissions.length == 0) throw new UnauthorizedException('You are not authorized to access this route');
        if(permissions){
            return true;
        }
    }
}