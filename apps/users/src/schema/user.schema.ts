import { Schema,Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { BaseEntity } from "@app/common";


@Schema({ timestamps: true })
export class UserProfile extends BaseEntity {
        @Prop({ unique: true })
        userId: string; // Reference to AUTH-SERVICE user ID

        @Prop({ unique: true })
        email: string; // Duplicated for queries

        @Prop()
        firstName: string;

        @Prop()
        lastName: string;

        @Prop({ })
        phoneNumber: string;

        @Prop({ })
        avatar: string;

        @Prop({ })
        dateOfBirth: Date;

        @Prop({ })
        bio: string;

        @Prop({ nullable: true })
        location: string;

        @Prop({ })
        preferences: Record<string, any>;

        @Prop({  })
        socialMedia: Record<string, string>;

        @Prop()
        createdAt: Date;

        @Prop()
        updatedAt: Date;

        get fullName(): string {
          return `${this.firstName} ${this.lastName}`.trim();
  }
}

export const UserSchema = SchemaFactory.createForClass(UserProfile)
