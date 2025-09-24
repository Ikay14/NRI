import { AbstractMongoRepository } from "@app/common";
import { Logger } from "@nestjs/common";
import { User } from "./schema/user.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

export class UserRepository extends AbstractMongoRepository<User> {
    protected readonly logger = new Logger(UserRepository.name)
    
    constructor (
        @InjectModel(User.name) userModel: Model<User>
    ){
        super(userModel)
    }
} 