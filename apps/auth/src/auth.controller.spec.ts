// // import { Test, TestingModule } from '@nestjs/testing';
// // import { AuthController } from './auth.controller';
// // import { AuthService } from './auth.service';

// // describe('AuthController', () => {
// //   let authController: AuthController;

// //   beforeEach(async () => {
// //     const app: TestingModule = await Test.createTestingModule({
// //       controllers: [AuthController],
// //       providers: [AuthService],
// //     }).compile();

// //     authController = app.get<AuthController>(AuthController);
// //   });

// //   describe('root', () => {
// //     it('should return "Hello World!"', () => {
// //       expect(authController.getHello()).toBe('Hello World!');
// //     });
// //   });
// // });


// // =============================================================================
// // COMMON SHARED LIBRARY - Database agnostic interfaces and utilities
// // =============================================================================

// // libs/common/interfaces/base-entity.interface.ts
// export interface BaseEntity {
//   id: string;
//   createdAt: Date;
//   updatedAt: Date;
// }

// // libs/common/interfaces/repository.interface.ts
// export interface IBaseRepository<T extends BaseEntity> {
//   create(document: Omit<T, 'id'>): Promise<T>;
//   findOne(filter: any): Promise<T | null>;
//   findMany(filter: any): Promise<T[]>;
//   update(id: string, update: Partial<T>): Promise<T | null>;
//   delete(id: string): Promise<boolean>;
// }

// // libs/common/dto/pagination.dto.ts
// export interface PaginationDto {
//   page: number;
//   limit: number;
//   total?: number;
// }

// // libs/common/exceptions/entity-not-found.exception.ts
// export class EntityNotFoundException extends Error {
//   constructor(entityName: string, filter: any) {
//     super(`${entityName} not found with filter: ${JSON.stringify(filter)}`);
//   }
// }

// // =============================================================================
// // MONGODB REPOSITORY LIBRARY
// // =============================================================================

// // libs/mongodb/abstract-mongo.repository.ts
// import { Logger, NotFoundException } from '@nestjs/common';
// import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';
// import { IBaseRepository, BaseEntity } from '../common/interfaces';

// export abstract class AbstractMongoRepository<TDocument extends BaseEntity> 
//   implements IBaseRepository<TDocument> {
  
//   protected abstract readonly logger: Logger;
  
//   constructor(protected readonly model: Model<any>) {}

//   async create(document: Omit<TDocument, 'id'>): Promise<TDocument> {
//     const createdDocument = new this.model({
//       ...document,
//       _id: new Types.ObjectId(),
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     });
    
//     const saved = await createdDocument.save();
//     return this.mapMongoToEntity(saved.toJSON());
//   }

//   async findOne(filterQuery: FilterQuery<any>): Promise<TDocument | null> {
//     const document = await this.model.findOne(filterQuery, {}, { lean: true });
    
//     if (!document) {
//       this.logger.warn(`Document not found with filterQuery:`, filterQuery);
//       return null;
//     }
    
//     return this.mapMongoToEntity(document);
//   }

//   async findMany(filterQuery: FilterQuery<any>): Promise<TDocument[]> {
//     const documents = await this.model.find(filterQuery, {}, { lean: true });
//     return documents.map(doc => this.mapMongoToEntity(doc));
//   }

//   async update(id: string, update: Partial<TDocument>): Promise<TDocument | null> {
//     const document = await this.model.findByIdAndUpdate(
//       id,
//       { ...update, updatedAt: new Date() },
//       { lean: true, new: true }
//     );

//     if (!document) {
//       this.logger.warn(`Document not found for update with id:`, id);
//       return null;
//     }

//     return this.mapMongoToEntity(document);
//   }

//   async delete(id: string): Promise<boolean> {
//     const result = await this.model.findByIdAndDelete(id);
//     return !!result;
//   }

//   // MongoDB specific methods
//   async findOneAndUpdate(filterQuery: FilterQuery<any>, update: UpdateQuery<any>) {
//     const document = await this.model.findOneAndUpdate(filterQuery, update, {
//       lean: true,
//       new: true,
//     });

//     if (!document) {
//       throw new NotFoundException('Document not found.');
//     }

//     return this.mapMongoToEntity(document);
//   }

//   async upsert(filterQuery: FilterQuery<any>, document: Partial<TDocument>) {
//     const result = await this.model.findOneAndUpdate(filterQuery, document, {
//       lean: true,
//       upsert: true,
//       new: true,
//     });
    
//     return this.mapMongoToEntity(result);
//   }

//   private mapMongoToEntity(document: any): TDocument {
//     return {
//       ...document,
//       id: document._id.toString(),
//     } as TDocument;
//   }
// }

// // =============================================================================
// // POSTGRESQL REPOSITORY LIBRARY  
// // =============================================================================

// // libs/postgresql/abstract-postgres.repository.ts
// import { Logger } from '@nestjs/common';
// import { Repository, FindOptionsWhere, DeepPartial } from 'typeorm';
// import { IBaseRepository, BaseEntity } from '../common/interfaces';

// export abstract class AbstractPostgresRepository<TEntity extends BaseEntity> 
//   implements IBaseRepository<TEntity> {
  
//   protected abstract readonly logger: Logger;
  
//   constructor(protected readonly repository: Repository<any>) {}

//   async create(document: Omit<TEntity, 'id'>): Promise<TEntity> {
//     const entity = this.repository.create({
//       ...document,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     });
    
//     const saved = await this.repository.save(entity);
//     return this.mapEntityToInterface(saved);
//   }

//   async findOne(filter: FindOptionsWhere<any>): Promise<TEntity | null> {
//     const entity = await this.repository.findOne({ where: filter });
    
//     if (!entity) {
//       this.logger.warn(`Entity not found with filter:`, filter);
//       return null;
//     }
    
//     return this.mapEntityToInterface(entity);
//   }

//   async findMany(filter: FindOptionsWhere<any>): Promise<TEntity[]> {
//     const entities = await this.repository.find({ where: filter });
//     return entities.map(entity => this.mapEntityToInterface(entity));
//   }

//   async update(id: string, update: Partial<TEntity>): Promise<TEntity | null> {
//     await this.repository.update(id, {
//       ...update,
//       updatedAt: new Date(),
//     } as DeepPartial<any>);
    
//     const updated = await this.repository.findOne({ where: { id } as any });
//     return updated ? this.mapEntityToInterface(updated) : null;
//   }

//   async delete(id: string): Promise<boolean> {
//     const result = await this.repository.delete(id);
//     return result.affected ? result.affected > 0 : false;
//   }

//   // PostgreSQL specific methods
//   async findWithRelations(filter: FindOptionsWhere<any>, relations: string[]) {
//     const entities = await this.repository.find({ 
//       where: filter, 
//       relations 
//     });
//     return entities.map(entity => this.mapEntityToInterface(entity));
//   }

//   async softDelete(id: string): Promise<boolean> {
//     const result = await this.repository.softDelete(id);
//     return result.affected ? result.affected > 0 : false;
//   }

//   private mapEntityToInterface(entity: any): TEntity {
//     return {
//       ...entity,
//       id: entity.id.toString(),
//     } as TEntity;
//   }
// }

// // =============================================================================
// // MICROSERVICE USAGE EXAMPLES
// // =============================================================================

// // USER MICROSERVICE (Using MongoDB)
// // apps/user-service/src/user/user.entity.ts
// export interface UserEntity extends BaseEntity {
//   email: string;
//   name: string;
//   role: string;
// }

// // apps/user-service/src/user/schemas/user.schema.ts
// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document } from 'mongoose';

// @Schema()
// export class User extends Document {
//   @Prop({ required: true, unique: true })
//   email: string;

//   @Prop({ required: true })
//   name: string;

//   @Prop({ default: 'user' })
//   role: string;

//   @Prop()
//   createdAt: Date;

//   @Prop()
//   updatedAt: Date;
// }

// export const UserSchema = SchemaFactory.createForClass(User);

// // apps/user-service/src/user/user.repository.ts
// import { Injectable, Logger } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { AbstractMongoRepository } from '@libs/mongodb';
// import { UserEntity } from './user.entity';
// import { User } from './schemas/user.schema';

// @Injectable()
// export class UserRepository extends AbstractMongoRepository<UserEntity> {
//   protected readonly logger = new Logger(UserRepository.name);

//   constructor(@InjectModel(User.name) userModel: Model<User>) {
//     super(userModel);
//   }

//   // User-specific MongoDB methods
//   async findByEmail(email: string): Promise<UserEntity | null> {
//     return this.findOne({ email });
//   }

//   async findActiveUsers(): Promise<UserEntity[]> {
//     return this.findMany({ isActive: true });
//   }
// }

// // =========================================================================

// // PRODUCT MICROSERVICE (Using PostgreSQL)
// // apps/product-service/src/product/product.entity.ts
// export interface ProductEntity extends BaseEntity {
//   name: string;
//   price: number;
//   categoryId: string;
//   isActive: boolean;
// }

// // apps/product-service/src/product/entities/product.entity.ts
// import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';

// @Entity('products')
// export class Product {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @Column()
//   name: string;

//   @Column('decimal', { precision: 10, scale: 2 })
//   price: number;

//   @Column()
//   categoryId: string;

//   @Column({ default: true })
//   isActive: boolean;

//   @CreateDateColumn()
//   createdAt: Date;

//   @UpdateDateColumn()
//   updatedAt: Date;
// }

// // apps/product-service/src/product/product.repository.ts
// import { Injectable, Logger } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { AbstractPostgresRepository } from '@libs/postgresql';
// import { ProductEntity } from './product.entity';
// import { Product } from './entities/product.entity';

// @Injectable()
// export class ProductRepository extends AbstractPostgresRepository<ProductEntity> {
//   protected readonly logger = new Logger(ProductRepository.name);

//   constructor(@InjectRepository(Product) productRepository: Repository<Product>) {
//     super(productRepository);
//   }

//   // Product-specific PostgreSQL methods
//   async findByCategory(categoryId: string): Promise<ProductEntity[]> {
//     return this.findMany({ categoryId, isActive: true });
//   }

//   async findExpensiveProducts(minPrice: number): Promise<ProductEntity[]> {
//     const products = await this.repository.find({
//       where: {
//         isActive: true,
//       },
//     });

//     // Custom filtering with business logic
//     return products
//       .filter(product => product.price >= minPrice)
//       .map(product => this.mapEntityToInterface(product));
//   }

//   private mapEntityToInterface(entity: Product): ProductEntity {
//     return {
//       id: entity.id,
//       name: entity.name,
//       price: entity.price,
//       categoryId: entity.categoryId,
//       isActive: entity.isActive,
//       createdAt: entity.createdAt,
//       updatedAt: entity.updatedAt,
//     };
//   }
// }

// // =============================================================================
// // PACKAGE.JSON STRUCTURE
// // =============================================================================

// /*
// Project Structure:

// libs/
// ├── common/                    # Shared interfaces and utilities
// │   ├── interfaces/
// │   ├── dto/
// │   └── exceptions/
// ├── mongodb/                   # MongoDB repository library
// │   └── abstract-mongo.repository.ts
// └── postgresql/               # PostgreSQL repository library
//     └── abstract-postgres.repository.ts

// apps/
// ├── user-service/             # Uses MongoDB
// │   └── src/user/
// │       ├── user.repository.ts
// │       └── schemas/user.schema.ts
// ├── product-service/          # Uses PostgreSQL  
// │   └── src/product/
// │       ├── product.repository.ts
// │       └── entities/product.entity.ts
// └── order-service/           # Could use either database
//     └── src/order/
//         └── order.repository.ts

// // package.json for each microservice
// {
//   "dependencies": {
//     "@libs/common": "*",
//     // User service includes:
//     "@libs/mongodb": "*",
//     // Product service includes:  
//     "@libs/postgresql": "*"
//   }
// }
// */ 