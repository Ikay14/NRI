import { Logger } from '@nestjs/common';
import { Repository, FindOptionsWhere, DeepPartial } from 'typeorm';
import { BaseEntity } from '@app/common/interface/base-entity.interface';
import { IBaseRepository } from '@app/common/interface/repository.interface';

export abstract class AbstractPostgresRepository<TEntity extends BaseEntity> 
  implements IBaseRepository<TEntity> {
  
  protected abstract readonly logger: Logger;
  
  constructor(protected readonly repository: Repository<any>) {}
 
  async create(document: Omit<TEntity, 'id'>): Promise<TEntity> {
    const entity = this.repository.create({
      ...document,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    const saved = await this.repository.save(entity);
    return this.mapEntityToInterface(saved);
  }

  async findOne(filter: FindOptionsWhere<any>): Promise<TEntity | null> {
    const entity = await this.repository.findOne({ where: filter });
    
    if (!entity) {
      this.logger.warn(`Entity not found with filter:`, filter);
      return null;
    }
    
    return this.mapEntityToInterface(entity);
  }

  async findMany(filter: FindOptionsWhere<any>): Promise<TEntity[]> {
    const entities = await this.repository.find({ where: filter });
    return entities.map(entity => this.mapEntityToInterface(entity));
  }

  async update(id: string, update: Partial<TEntity>): Promise<TEntity | null> {
    await this.repository.update(id, {
      ...update,
      updatedAt: new Date(),
    } as DeepPartial<any>);
    
    const updated = await this.repository.findOne({ where: { id } as any });
    return updated ? this.mapEntityToInterface(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  // PostgreSQL specific methods
  async findWithRelations(filter: FindOptionsWhere<any>, relations: string[]) {
    const entities = await this.repository.find({ 
      where: filter, 
      relations 
    });
    return entities.map(entity => this.mapEntityToInterface(entity));
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return result.affected ? result.affected > 0 : false;
  }

  private mapEntityToInterface(entity: any): TEntity {
    return {
      ...entity,
      id: entity.id.toString(),
    } as TEntity;
  }
}