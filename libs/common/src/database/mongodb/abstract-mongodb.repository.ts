import { Logger, NotFoundException } from '@nestjs/common';
import { FilterQuery, Model, SaveOptions, Types, UpdateQuery } from 'mongoose';
import { BaseEntity } from '@app/common/interface/base-entity.interface';
import { IBaseRepository } from '@app/common/interface/repository.interface';


export abstract class AbstractMongoRepository<TDocument extends BaseEntity> 
  implements IBaseRepository<TDocument> {
  
  protected abstract readonly logger: Logger;
  
  constructor(protected readonly model: Model<any>) {}

  async create(document: Omit<TDocument, 'id'>, 
    options?: SaveOptions,
  ): Promise<TDocument> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    const saved = await createdDocument.save(options);
    return this.mapMongoToEntity(saved.toJSON());
  }

  async findOne(filterQuery: FilterQuery<any>): Promise<TDocument | null> {
    const document = await this.model.findOne(filterQuery, {}, { lean: true });
    
    if (!document) {
      this.logger.warn(`Document not found with filterQuery:`, filterQuery);
      return null;
    }
    
    return this.mapMongoToEntity(document);
  }

  async findMany(filterQuery: FilterQuery<any>): Promise<TDocument[]> {
    const documents = await this.model.find(filterQuery, {}, { lean: true });
    return documents.map(doc => this.mapMongoToEntity(doc));
  }

  async update(id: string, update: Partial<TDocument>): Promise<TDocument | null> {
    const document = await this.model.findByIdAndUpdate(
      id,
      { ...update, updatedAt: new Date() },
      { lean: true, new: true }
    );

    if (!document) {
      this.logger.warn(`Document not found for update with id:`, id);
      return null;
    }

    return this.mapMongoToEntity(document);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return !!result;
  }

  // MongoDB specific methods
  async findOneAndUpdate(filterQuery: FilterQuery<any>, update: UpdateQuery<any>) {
    const document = await this.model.findOneAndUpdate(filterQuery, update, {
      lean: true,
      new: true,
    });

    if (!document) {
      throw new NotFoundException('Document not found.');
    }

    return this.mapMongoToEntity(document);
  }

  async upsert(filterQuery: FilterQuery<any>, document: Partial<TDocument>) {
    const result = await this.model.findOneAndUpdate(filterQuery, document, {
      lean: true,
      upsert: true,
      new: true,
    });
    
    return this.mapMongoToEntity(result);
  }

  private mapMongoToEntity(document: any): TDocument {
    return {
      ...document,
      id: document._id.toString(),
    } as TDocument;
  }
}