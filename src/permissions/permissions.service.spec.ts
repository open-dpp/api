import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsService } from './permissions.service';
import { KeycloakResourcesService } from '../keycloak-resources/infrastructure/keycloak-resources.service';
import { AuthContext } from '../auth/auth-request';
import { User } from '../users/domain/user';
import { ForbiddenException, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let mockKeycloakResourcesService: Partial<KeycloakResourcesService>;
  let authContext: AuthContext;
  let userId: string;
  let organizationId: string;

  beforeEach(async () => {
    // Mock dependencies
    mockKeycloakResourcesService = {
      // Add any methods used by PermissionsService here
    };

    // Create test AuthContext with user and permissions
    userId = randomUUID();
    organizationId = randomUUID();
    authContext = new AuthContext();
    authContext.user = new User(userId, 'test@example.com');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        {
          provide: KeycloakResourcesService,
          useValue: mockKeycloakResourcesService,
        },
      ],
    }).compile();

    // Silence logger during tests
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    service = module.get<PermissionsService>(PermissionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('canAccessOrganization', () => {
    it('should return false if user has no permissions', async () => {
      authContext.permissions = undefined;
      const result = await service.canAccessOrganization(
        organizationId,
        authContext,
      );
      expect(result).toBe(false);
    });

    it('should return false if user has no matching permission', async () => {
      authContext.permissions = [
        {
          type: 'organization',
          resource: 'other-org-id',
          scopes: ['organization:access'],
        },
      ];
      const result = await service.canAccessOrganization(
        organizationId,
        authContext,
      );
      expect(result).toBe(false);
    });

    it('should return false if user has matching organization but wrong scope', async () => {
      authContext.permissions = [
        {
          type: 'organization',
          resource: organizationId,
          scopes: ['organization:edit'],
        },
      ];
      const result = await service.canAccessOrganization(
        organizationId,
        authContext,
      );
      expect(result).toBe(false);
    });

    it('should return true if user has matching organization and access scope', async () => {
      authContext.permissions = [
        {
          type: 'organization',
          resource: organizationId,
          scopes: ['organization:access'],
        },
      ];
      const result = await service.canAccessOrganization(
        organizationId,
        authContext,
      );
      expect(result).toBe(true);
    });

    it('should return true if user has matching organization and multiple scopes including access', async () => {
      authContext.permissions = [
        {
          type: 'organization',
          resource: organizationId,
          scopes: [
            'organization:edit',
            'organization:access',
            'organization:delete',
          ],
        },
      ];
      const result = await service.canAccessOrganization(
        organizationId,
        authContext,
      );
      expect(result).toBe(true);
    });
  });

  describe('canAccessOrganizationOrFail', () => {
    it('should throw ForbiddenException if user cannot access organization', async () => {
      authContext.permissions = [];
      await expect(
        service.canAccessOrganizationOrFail(organizationId, authContext),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return true if user can access organization', async () => {
      authContext.permissions = [
        {
          type: 'organization',
          resource: organizationId,
          scopes: ['organization:access'],
        },
      ];
      const result = await service.canAccessOrganizationOrFail(
        organizationId,
        authContext,
      );
      expect(result).toBe(true);
    });
  });

  describe('hasPermission', () => {
    it('should return false if user has no permissions', async () => {
      authContext.permissions = undefined;
      const result = await service.hasPermission(authContext, [
        { type: 'organization', resource: 'resource1' },
      ]);
      expect(result).toBe(false);
    });

    it('should return false if user does not have required resource permission', async () => {
      authContext.permissions = [
        {
          type: 'organization',
          resource: 'organization:resource1',
          scopes: ['read'],
        },
      ];
      const result = await service.hasPermission(authContext, [
        { type: 'organization', resource: 'resource2' },
      ]);
      expect(result).toBe(false);
    });

    it('should return false if user has resource but is missing required scope', async () => {
      authContext.permissions = [
        {
          type: 'organization',
          resource: 'organization:resource1',
          scopes: ['read'],
        },
      ];
      const result = await service.hasPermission(authContext, [
        { type: 'organization', resource: 'resource1', scopes: ['write'] },
      ]);
      expect(result).toBe(false);
    });

    it('should return true if user has all required permissions without scopes', async () => {
      authContext.permissions = [
        {
          type: 'organization',
          resource: 'organization:resource1',
          scopes: ['read'],
        },
      ];
      const result = await service.hasPermission(authContext, [
        { type: 'organization', resource: 'resource1' },
      ]);
      expect(result).toBe(true);
    });

    it('should return true if user has all required permissions with matching scopes', async () => {
      authContext.permissions = [
        {
          type: 'organization',
          resource: 'organization:resource1',
          scopes: ['read', 'write'],
        },
      ];
      const result = await service.hasPermission(authContext, [
        { type: 'organization', resource: 'resource1', scopes: ['read'] },
      ]);
      expect(result).toBe(true);
    });

    it('should return true if user has all required permissions for multiple resources', async () => {
      authContext.permissions = [
        {
          type: 'organization',
          resource: 'organization:resource1',
          scopes: ['read', 'write'],
        },
        {
          type: 'organization',
          resource: 'organization:resource2',
          scopes: ['read', 'delete'],
        },
      ];
      const result = await service.hasPermission(authContext, [
        { type: 'organization', resource: 'resource1', scopes: ['write'] },
        { type: 'organization', resource: 'resource2', scopes: ['read'] },
      ]);
      expect(result).toBe(true);
    });

    it('should return false if user is missing one of multiple required permissions', async () => {
      authContext.permissions = [
        {
          type: 'organization',
          resource: 'organization:resource1',
          scopes: ['read', 'write'],
        },
        {
          type: 'organization',
          resource: 'organization:resource2',
          scopes: ['read'],
        },
      ];
      const result = await service.hasPermission(authContext, [
        { type: 'organization', resource: 'resource1', scopes: ['write'] },
        { type: 'organization', resource: 'resource2', scopes: ['delete'] },
      ]);
      expect(result).toBe(false);
    });
  });
});
