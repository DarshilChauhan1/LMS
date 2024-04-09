import { SetMetadata } from "@nestjs/common"

export interface RequiredRule{
    action : string,
    subject : string,
}

export const CHECK_ABILITIES = 'check_abilities'

export const CheckAbilities = (...rules: RequiredRule[]) => {
    return (target: any, key?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => {
        SetMetadata(CHECK_ABILITIES, rules)(target, key, descriptor);
    }
}