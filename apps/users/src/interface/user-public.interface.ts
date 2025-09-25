export interface PublicUserEntity {
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: string;
  bio?: string;
  location?: string;
}