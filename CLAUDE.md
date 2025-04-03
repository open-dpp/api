# CLAUDE.md - Development Guide

## Commands
- Build: `npm run build`
- Lint: `npm run lint` (ESLint with fix for TS files)
- Format: `npm run format` (Prettier for TS files)
- Test: `npm run test` (runs migrations then Jest)
- Single test: `npm test -- -t "test name"` or `npm run test:watch -- path/to/file.spec.ts`
- TypeORM: `npm run migration:generate -- src/migrations/name` (migrations)

## Code Style
- **Architecture**: Domain-Driven Design with NestJS modules
- **File naming**: kebab-case.ts (e.g., items.controller.ts, user.entity.ts)
- **Class naming**: PascalCase (e.g., ItemsController, UserEntity)
- **Imports**: NestJS first, third-party next, internal last, alphabetical within groups
- **Types**: Strong typing, DTOs for validation, explicit return types on methods
- **Error handling**: Use NestJS exceptions (NotFoundException, BadRequestException)
- **Testing**: Jest tests named .spec.ts, mocked dependencies, clear describe/it blocks
- **Organization**: Domain models separate from entities, controllers delegate to services

Maintain clear separation of concerns between domain logic and infrastructure.