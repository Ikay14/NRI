import { Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BaseEntity } from '@app/common/interface/base-entity.interface';
import { AbstractPostgresRepository } from './abstract.postgresql.repository';

interface TestEntity extends BaseEntity {
  name: string;
}

class TestPostgresRepository extends AbstractPostgresRepository<TestEntity> {
  protected readonly logger = new Logger(TestPostgresRepository.name);
}

describe('AbstractPostgresRepository', () => {
  let repo: TestPostgresRepository;
  let mockTypeOrmRepo: jest.Mocked<Partial<Repository<any>>>;

  beforeEach(() => {
    mockTypeOrmRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    repo = new TestPostgresRepository(mockTypeOrmRepo as unknown as Repository<any>);
  });

  it('creates and maps an entity without calling .toJSON()', async () => {
    const input = { name: 'Jollof Rice' };
    const createdEntity = { ...input, createdAt: new Date(), updatedAt: new Date() };
    const savedEntity = { id: 123, ...createdEntity };

    (mockTypeOrmRepo.create as jest.Mock).mockReturnValue(createdEntity);
    (mockTypeOrmRepo.save as jest.Mock).mockResolvedValue(savedEntity);

    const result = await repo.create(input);

    expect(mockTypeOrmRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Jollof Rice' }),
    );
    expect(mockTypeOrmRepo.save).toHaveBeenCalledWith(createdEntity, undefined);
    expect(result).toEqual(
      expect.objectContaining({
        id: '123',
        name: 'Jollof Rice',
      }),
    );
  });

  it('returns null when findOne finds no entity', async () => {
    (mockTypeOrmRepo.findOne as jest.Mock).mockResolvedValue(null);

    const result = await repo.findOne({ id: 'missing' });

    expect(result).toBeNull();
  });

  it('deletes an entity and returns true when affected > 0', async () => {
    (mockTypeOrmRepo.delete as jest.Mock).mockResolvedValue({ affected: 1 });

    const result = await repo.delete('123');

    expect(result).toBe(true);
  });
});
