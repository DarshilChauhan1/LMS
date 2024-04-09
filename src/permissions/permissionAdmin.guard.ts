import { CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";;
import { Role } from "src/roles/entities/role.entity";
import { User } from "src/users/entities/user.entity";

export class PermissionAdminGuard implements CanActivate{
    constructor(
        @InjectModel('Role') private roleModel : Model<Role>,
        @InjectModel('User') private readonly userModel : Model<User>){}
    async canActivate(context: ExecutionContext): Promise<boolean> {
         const request = context.switchToHttp().getRequest();
         const userId = request.user.id;

         const findUserByRole = await this.userModel.findById(userId).select('role_id');
         const adminRole = await this.roleModel.find({role : {$in : ['admin', 'super_admin']}}).select('_id');
         const roles = JSON.parse(JSON.stringify(adminRole));
         const userRole = JSON.parse(JSON.stringify(findUserByRole));

        
        if(roles.some((role : any) => userRole.role_id.includes(role._id))) return true;
        throw new UnauthorizedException('You are not authorized to access this route');
    }
}