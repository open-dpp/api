import { Test, TestingModule } from '@nestjs/testing';
import { KeycloakAuthGuard } from './keycloak-auth.guard';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/infrastructure/users.service';
import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC } from '../decorators/public.decorator';
import { KeycloakUserInToken } from './KeycloakUserInToken';
import { User } from '../../users/domain/user';
import { HttpModule } from '@nestjs/axios';
import { ALLOW_SERVICE_ACCESS } from '../decorators/allow-service-access.decorator';

describe('KeycloakAuthGuard', () => {
  let guard: KeycloakAuthGuard;
  let reflector: Reflector;
  let usersService: UsersService;

  const mockUser: KeycloakUserInToken = {
    sub: 'test-user-id',
    email: 'user@example.com',
    name: 'Test User',
    preferred_username: 'testuser',
    email_verified: true,
    memberships: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        KeycloakAuthGuard,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest
              .fn()
              .mockImplementation((key) =>
                key === 'SERVICE_TOKEN' ? 'serviceToken' : 'mock-public-key',
              ),
          },
        },
        {
          provide: UsersService,
          useValue: {
            create: jest
              .fn()
              .mockResolvedValue(new User('test-user-id', 'user@example.com')),
          },
        },
      ],
    }).compile();

    guard = module.get<KeycloakAuthGuard>(KeycloakAuthGuard);
    reflector = module.get<Reflector>(Reflector);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let context: ExecutionContext;
    let mockRequest: any;

    beforeEach(() => {
      mockRequest = {
        headers: {},
      };
      context = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
        getHandler: () => ({}),
      } as unknown as ExecutionContext;
    });

    it('should return true for public routes', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue(true);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(reflector.get).toHaveBeenCalledWith(IS_PUBLIC, expect.any(Object));
    });

    it('should throw unauthorized exception when authorization header is missing', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue(false);

      await expect(guard.canActivate(context)).rejects.toThrow(
        new HttpException('Authorization missing', HttpStatus.UNAUTHORIZED),
      );
    });

    it('should throw unauthorized exception when authorization format is invalid', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue(false);
      mockRequest.headers.authorization = 'InvalidFormat';

      await expect(guard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException(
          'Authorization: Bearer <token> header invalid',
        ),
      );
    });

    it('should authenticate with service token', async () => {
      jest
        .spyOn(reflector, 'get')
        .mockImplementation((key) => key === ALLOW_SERVICE_ACCESS);

      mockRequest.headers.service_token = 'serviceToken';

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
      expect(mockRequest.authContext).toBeUndefined();
    });

    it('should fail to authenticate with invalid service token', async () => {
      jest
        .spyOn(reflector, 'get')
        .mockImplementation((key) => key === ALLOW_SERVICE_ACCESS);

      mockRequest.headers.service_token = 'INVALID_TOKEN';

      await expect(guard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException('Invalid service token.'),
      );
    });

    it('should authenticate user and set auth context with permissions', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue(false);
      mockRequest.headers.authorization = 'Bearer valid-token';

      const mockPayload = {
        ...mockUser,
        memberships: ['organization-org1', 'organization-org2'],
      };

      jest.spyOn(guard, 'validateToken').mockResolvedValue(mockPayload);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(usersService.create).toHaveBeenCalledWith(mockPayload, true);
      expect(mockRequest.authContext).toBeDefined();
      expect(mockRequest.authContext.user).toEqual(
        new User('test-user-id', 'user@example.com'),
      );
      expect(mockRequest.authContext.keycloakUser).toEqual(mockPayload);
      expect(mockRequest.authContext.permissions).toEqual([
        {
          type: 'organization',
          resource: 'org1',
          scopes: ['organization:access'],
        },
        {
          type: 'organization',
          resource: 'org2',
          scopes: ['organization:access'],
        },
      ]);
    });

    it('should handle empty memberships', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue(false);
      mockRequest.headers.authorization = 'Bearer valid-token';

      const mockPayload = {
        ...mockUser,
        // No memberships property
      };

      jest.spyOn(guard, 'validateToken').mockResolvedValue(mockPayload);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockRequest.authContext.permissions).toEqual([]);
    });
  });
});
