export class EntityNotFoundException extends Error {
  constructor(entityName: string, filter: any) {
    super(`${entityName} not found with filter: ${JSON.stringify(filter)}`);
  }
}