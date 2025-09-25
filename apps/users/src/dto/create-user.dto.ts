import { IsString } from 'class-validator'

export class CreateProfileDto {
    @IsString()
    firstName: string

    @IsString()
    lastName: string

    @IsString()
    email: string

    @IsString()
    userId: string
}