import { SetMetadata } from "@nestjs/common"

export const CHECK_GUARD_NAME = 'check_guard_name'
export const GuardName = (name: string) => SetMetadata(CHECK_GUARD_NAME, name);