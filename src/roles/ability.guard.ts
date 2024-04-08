import { createMongoAbility, InferSubjects, MongoAbility, RawRuleOf } from "@casl/ability";
import { CanActivate, ExecutionContext, Inject } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { User } from "../users/entities/user.entity";
import { Book } from "src/books/entities/book.entity";
import { Test } from "src/tests/entities/test.entity";
import { Profile } from "src/profiles/entities/profile.entity";
import { Assignment } from "src/assignments/entities/assignment.entity";
import { ActionEnum } from "./enum/action.enum";
import { CHECK_ABILITIES, RequiredRule } from "src/common/decorators/ability.decorator";
import { Model } from "mongoose";
import { Permission } from "../permissions/entities/permission.entity";
import * as Mustache from 'mustache'

export type Subjects = InferSubjects<typeof User | typeof Book | typeof Test | typeof Profile | typeof Assignment | 'all'>

export type AppAbility = MongoAbility<[ActionEnum, Subjects]>

export class AbilityGuard implements CanActivate{
    constructor(
        @Inject('Permission') private permissionModel : Model<Permission>,
        private reflector : Reflector){}
    createAbility = (rules : RawRuleOf<AppAbility>[] )=> createMongoAbility(rules);
    async canActivate(context: ExecutionContext):  Promise<any> {
        const rules : any = this.reflector.get<RequiredRule[]>(CHECK_ABILITIES, context.getHandler()) || [];
        console.log(rules)
        const currentUser = context.switchToHttp().getRequest().user;

        //we will find the permissions for that user from permissions
        const userPermissions = await this.permissionModel.find({role_id : currentUser.role_id});

        const parseUserPermissions = this.parsedConditions(userPermissions, currentUser);
        
        try {
            const ability = this.createAbility(Object(parseUserPermissions));
            console.log(ability);
        } catch (error) {
            
        }


    }

    private parsedConditions(permissions : any, currentUser : User){
        const data = permissions.map((permission : any) => {
            if(permission.length > 0 && permission.conditions){
                const parsedValue = Mustache.rander(permission.conditions['created_by'], currentUser);
                return {...permission, conditions :  {created_by : +parsedValue}}
            }
            return permission
            
        })
        return data
    }
}