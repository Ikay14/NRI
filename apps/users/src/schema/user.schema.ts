import { Schema,Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { BaseEntity } from "@app/common";


@Schema({ timestamps: true, versionKey: false })
export class User extends BaseEntity {          

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  password: string;

  @Prop()
  location?: string;   // fixed typo
}


export const UserSchema = SchemaFactory.createForClass(User)
