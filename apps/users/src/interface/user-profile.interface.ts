import { BaseEntity } from "@app/common";

export interface UserProfileEntity extends BaseEntity {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  avatar?: string;
  dateOfBirth?: Date;
  bio?: string;
  location?: string;
  preferences?: Record<string, any>;
  socialMedia?: Record<string, string>;
  fullName?: string;

}