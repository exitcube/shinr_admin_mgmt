# Models Folder

This folder contains all TypeORM entities for the application.

## Structure

- `index.ts` - Central import/export file for all entities
- `User.ts` - User entity example
- `README.md` - This documentation file

## Adding New Entities

1. Create a new entity file (e.g., `Product.ts`)
2. Import the entity in `index.ts`
3. Add it to the `entities` array in `index.ts`
4. run this command to generate :  npm run migration:generate -- migrations/migrationFileName
5. run this command to migrate the changes to db : npm run migration:run
6. to revert the last migration run npm run migration:revert
7. If the enotyt belongs to this migration please add it into `ownedEntities` in model.
    Ensure any changes u need to make to other model the migration should happen from that microservice.


### Example:

```typescript
// models/Product.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;
}
```

```typescript
// models/index.ts
import { User } from './User';
import { Product } from './Product';

export const entities = [
    User,
    Product,
];

// Optional: Export individual entities
export { User } from './User';
export { Product } from './Product';
```

## Benefits

- **Centralized management**: All entities are imported in one place
- **Clean imports**: Database config only needs to import from models/index
- **Easy maintenance**: Adding/removing entities is straightforward
- **Better organization**: Clear separation of concerns

