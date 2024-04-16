import { SetMetadata } from "@nestjs/common";

export const IS_PROTECTED_KEY = 'isProtected';
export function ProtectedRoute() {
    return SetMetadata(IS_PROTECTED_KEY, true);
  }