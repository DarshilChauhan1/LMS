import { SetMetadata } from "@nestjs/common"

export interface RequiredRule{
    action : string,
    subject : string,
    conditions ?: JSON
}

export const CHECK_ABILITIES = 'check_abilities'

export const CheckAbilities = (...rules : RequiredRule[]) => SetMetadata( CHECK_ABILITIES, rules)
