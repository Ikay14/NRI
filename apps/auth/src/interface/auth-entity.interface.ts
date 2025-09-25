import { BaseEntity } from "@app/common"

export interface AuthEntity extends BaseEntity {
    email: string;
    role?: 'user' | 'admin' | 'super-admin';
    isActive?: boolean;
    isEmailVerified?: boolean;
}