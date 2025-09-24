import { BaseEntity } from "./base-entity.interface";

export interface IBaseRepository<T extends BaseEntity> {
  create(document: Omit<T, 'id'>): Promise<T>;
  findOne(filter: any): Promise<T | null>;
  findMany(filter: any): Promise<T[]>;
  update(id: string, update: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}