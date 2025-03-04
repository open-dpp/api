# Keycloak Permissions Module

This module provides a way to check user permissions against Keycloak resources using a decorator.

## Usage

### 1. Use the HasPermissions decorator on a controller method

```typescript
import { Controller, Get, Param } from '@nestjs/common';
import { HasPermissions } from '../../auth/permissions/permissions.decorator';
import { OrganizationService } from '../infrastructure/organization.service';

@Controller('organizations')
export class OrganizationsController {
  constructor(private organizationService: OrganizationService) {}

  @Get(':id')
  @HasPermissions([{ type: 'organization', resource: ':id', scopes: ['read'] }])
  async getOrganization(@Param('id') id: string) {
    return this.organizationService.findOne(id);
  }

  @Get(':id/members')
  @HasPermissions([
    { type: 'organization', resource: ':id', scopes: ['read'] },
    { type: 'members', resource: ':id', scopes: ['read'] }
  ])
  async getOrganizationMembers(@Param('id') id: string) {
    return this.organizationService.getMembers(id);
  }
}
```

### 2. Dynamic Resource IDs

For dynamic resource IDs (from route parameters), use the parameter name preceded by a colon (e.g. `:id`). The guard will automatically replace these with the actual values from the request.

### 3. Multiple Permissions

You can specify multiple required permissions by passing an array to the decorator. The user must have ALL of the specified permissions to access the endpoint.

### 4. Permission Scopes

You can specify required scopes for each permission. If provided, the user must have ALL of the specified scopes for that resource.

## How It Works

1. The `HasPermissions` decorator adds metadata to the route handler.
2. The `KeycloakPermissionsGuard` intercepts requests and checks if the route is decorated with `HasPermissions`.
3. If permissions are required, the guard uses the `PermissionsService` to check if the user has all required permissions.
4. The `PermissionsService` checks the user's permissions against Keycloak's authorization service.

## Fetching User Permissions

The module provides several ways to fetch and check user permissions:

### Using the Guard (Automatic)

When using the `@HasPermissions` decorator, the guard automatically checks permissions.

### Using PermissionsService (Programmatic)

For more granular control, inject the `PermissionsService` in your components:

```typescript
@Injectable()
export class YourService {
  constructor(private permissionsService: PermissionsService) {}

  async someMethod(userId: string, organizationId: string) {
    // Check if user has a specific permission
    const hasPermission = await this.permissionsService.checkResourcePermission(
      userId,
      'organization',
      organizationId,
      ['read', 'write']
    );

    if (hasPermission) {
      // User has permission, proceed
    } else {
      // User doesn't have permission, handle accordingly
      throw new ForbiddenException('Insufficient permissions');
    }
  }

  // Get all user permissions
  async getAllUserPermissions(userId: string) {
    return this.permissionsService.getUserPermissions(userId);
  }
}
```

### Direct Access via KeycloakResourcesService

For direct access to Keycloak permissions, you can use the KeycloakResourcesService:

```typescript
@Injectable()
export class YourService {
  constructor(private keycloakResourcesService: KeycloakResourcesService) {}

  async fetchPermissions(userId: string) {
    // Get all permissions for a user
    const allPermissions = await this.keycloakResourcesService.getUserPermissions(userId);
    
    // Get permissions for a specific resource
    const resourcePermission = await this.keycloakResourcesService.getUserResourcePermission(
      userId,
      'resource-id-here'
    );
  }
}
```

## Configuration

No additional configuration is needed beyond setting up Keycloak itself. The module uses the KeycloakResourcesService to interact with Keycloak.