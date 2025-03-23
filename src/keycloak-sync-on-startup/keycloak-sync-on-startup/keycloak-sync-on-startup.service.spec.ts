import { Test, TestingModule } from '@nestjs/testing';
import { KeycloakSyncOnStartupService } from './keycloak-sync-on-startup.service';
import { UsersService } from '../../users/infrastructure/users.service';
import { KeycloakResourcesService } from '../../keycloak-resources/infrastructure/keycloak-resources.service';
import { OrganizationsService } from '../../organizations/infrastructure/organizations.service';
import { Logger } from '@nestjs/common';
import { Organization } from '../../organizations/domain/organization';
import { User } from '../../users/domain/user';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../../users/users.module';

jest.mock('@keycloak/keycloak-admin-client', () => {
  return {
    __esModule: true, // Ensure Jest understands it's an ES module
    default: jest.fn(() => ({
      auth: jest.fn().mockResolvedValue(undefined),
      users: {
        find: jest.fn().mockResolvedValue([]), // Mock user retrieval returning empty array
        findOne: jest.fn().mockResolvedValue({ id: 'mock-user-id' }),
        create: jest.fn().mockResolvedValue({ id: 'mock-user-id' }),
        update: jest.fn().mockResolvedValue(undefined),
        del: jest.fn().mockResolvedValue(undefined),
        addToGroup: jest.fn().mockResolvedValue(undefined),
        listGroups: jest.fn().mockResolvedValue([{ id: 'mock-group-id' }]),
      },
      realms: {
        find: jest
          .fn()
          .mockResolvedValue([{ id: 'mock-realm-id', realm: 'test-realm' }]),
      },
      groups: {
        find: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockResolvedValue({ id: 'mock-group-id' }),
        update: jest.fn().mockResolvedValue(undefined),
        del: jest.fn().mockResolvedValue(undefined),
      },
    })),
  };
});

describe('UsersSyncOnStartupService', () => {
  let service: KeycloakSyncOnStartupService;
  let usersService: UsersService;
  let keycloakResourcesService: KeycloakResourcesService;
  let organizationsService: OrganizationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule, UsersModule],
      providers: [
        KeycloakSyncOnStartupService,
        KeycloakResourcesService,
        {
          provide: OrganizationsService,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<KeycloakSyncOnStartupService>(
      KeycloakSyncOnStartupService,
    );
    usersService = module.get<UsersService>(UsersService);
    keycloakResourcesService = module.get<KeycloakResourcesService>(
      KeycloakResourcesService,
    );
    organizationsService =
      module.get<OrganizationsService>(OrganizationsService);

    // Mock Logger to prevent console output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onApplicationBootstrap', () => {
    it('should sync users from Keycloak to database', async () => {
      // Mock data
      const keycloakUsers = [
        {
          id: 'user1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          emailVerified: true,
          username: 'johndoe',
        },
        {
          id: 'user2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          emailVerified: true,
          username: 'janesmith',
        },
      ];

      const organization = Organization.fromPlain({
        id: 'org1',
        name: 'Organization 1',
        members: [
          new User('user1', 'john@example.com'),
          new User('user2', 'jane@example.com'),
        ],
        createdByUserId: 'user1',
        ownedByUserId: 'user1',
      });

      const organizations = [organization];

      // Setup mocks
      jest
        .spyOn(keycloakResourcesService, 'getUsers')
        .mockResolvedValue(keycloakUsers);
      jest
        .spyOn(usersService, 'findOne')
        .mockResolvedValueOnce(new User('user1', 'john@example.com')) // First user exists
        .mockResolvedValueOnce(undefined); // Second user doesn't exist
      jest
        .spyOn(organizationsService, 'findAll')
        .mockResolvedValue(organizations);
      jest
        .spyOn(keycloakResourcesService, 'getGroupForOrganization')
        .mockResolvedValue(null); // Group doesn't exist, will be created

      // Execute
      await service.sync();

      // Verify
      expect(keycloakResourcesService.getUsers).toHaveBeenCalledTimes(1);
      expect(usersService.findOne).toHaveBeenCalledTimes(2);
      expect(usersService.findOne).toHaveBeenCalledWith('user1');
      expect(usersService.findOne).toHaveBeenCalledWith('user2');

      // Should only create the second user (first one exists)
      expect(usersService.create).toHaveBeenCalledTimes(1);
      expect(usersService.create).toHaveBeenCalledWith({
        sub: 'user2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        email_verified: true,
        preferred_username: 'janesmith',
      });

      // Organizations
      expect(organizationsService.findAll).toHaveBeenCalledTimes(1);
      expect(
        keycloakResourcesService.getGroupForOrganization,
      ).toHaveBeenCalledTimes(1);
      expect(
        keycloakResourcesService.getGroupForOrganization,
      ).toHaveBeenCalledWith('org1');
      expect(keycloakResourcesService.createGroup).toHaveBeenCalledTimes(1);
      expect(keycloakResourcesService.createGroup).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'org1',
          name: 'Organization 1',
        }),
      );

      // User invitations
      expect(keycloakResourcesService.inviteUserToGroup).toHaveBeenCalledTimes(
        2,
      );
    });

    it('should handle case when keycloak group exists', async () => {
      // Mock data
      const keycloakUsers = [];

      const organization = Organization.fromPlain({
        id: 'org1',
        name: 'Organization 1',
        members: [new User('user1', 'john@example.com')],
        createdByUserId: 'user1',
        ownedByUserId: 'user1',
      });

      const organizations = [organization];

      // Setup mocks
      jest
        .spyOn(keycloakResourcesService, 'getUsers')
        .mockResolvedValue(keycloakUsers);
      jest
        .spyOn(organizationsService, 'findAll')
        .mockResolvedValue(organizations);
      jest
        .spyOn(keycloakResourcesService, 'getGroupForOrganization')
        .mockResolvedValue({ id: 'group1', name: 'organization-org1' }); // Group exists

      // Execute
      await service.sync();

      // Verify
      expect(
        keycloakResourcesService.getGroupForOrganization,
      ).toHaveBeenCalledTimes(1);
      expect(keycloakResourcesService.createGroup).not.toHaveBeenCalled(); // Group exists, shouldn't create
      expect(keycloakResourcesService.inviteUserToGroup).toHaveBeenCalledTimes(
        1,
      );
    });

    it('should handle error when inviting user to group', async () => {
      console.warn = jest.fn(); // Mock console.warn

      // Mock data
      const keycloakUsers = [];

      const organization = Organization.fromPlain({
        id: 'org1',
        name: 'Organization 1',
        members: [new User('user1', 'john@example.com')],
        createdByUserId: 'user1',
        ownedByUserId: 'user1',
      });

      const organizations = [organization];

      // Setup mocks
      jest
        .spyOn(keycloakResourcesService, 'getUsers')
        .mockResolvedValue(keycloakUsers);
      jest
        .spyOn(organizationsService, 'findAll')
        .mockResolvedValue(organizations);
      jest
        .spyOn(keycloakResourcesService, 'getGroupForOrganization')
        .mockResolvedValue({ id: 'group1', name: 'organization-org1' });

      // Mock inviteUserToGroup to throw a non-400 error
      jest
        .spyOn(keycloakResourcesService, 'inviteUserToGroup')
        .mockRejectedValue({ status: 500, message: 'Server error' });

      // Execute
      await service.sync();

      // Verify
      expect(keycloakResourcesService.inviteUserToGroup).toHaveBeenCalledTimes(
        1,
      );
      expect(console.warn).toHaveBeenCalledTimes(1);
    });

    it('should not log error when inviting user fails with 400 status', async () => {
      console.warn = jest.fn(); // Mock console.warn

      // Mock data
      const keycloakUsers = [];

      const organization = Organization.fromPlain({
        id: 'org1',
        name: 'Organization 1',
        members: [new User('user1', 'john@example.com')],
        createdByUserId: 'user1',
        ownedByUserId: 'user1',
      });

      const organizations = [organization];

      // Setup mocks
      jest
        .spyOn(keycloakResourcesService, 'getUsers')
        .mockResolvedValue(keycloakUsers);
      jest
        .spyOn(organizationsService, 'findAll')
        .mockResolvedValue(organizations);
      jest
        .spyOn(keycloakResourcesService, 'getGroupForOrganization')
        .mockResolvedValue({ id: 'group1', name: 'organization-org1' });

      // Mock inviteUserToGroup to throw a 400 error
      jest
        .spyOn(keycloakResourcesService, 'inviteUserToGroup')
        .mockRejectedValue({ status: 400, message: 'Bad request' });

      // Execute
      await service.sync();

      // Verify
      expect(keycloakResourcesService.inviteUserToGroup).toHaveBeenCalledTimes(
        1,
      );
      expect(console.warn).not.toHaveBeenCalled(); // Should not log 400 errors
    });
  });
});
