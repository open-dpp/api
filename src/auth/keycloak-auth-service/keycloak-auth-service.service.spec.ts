import {Test, TestingModule} from '@nestjs/testing';
import {KeycloakAuthServiceService} from './keycloak-auth.service';

describe('KeycloakAuthServiceService', () => {
    let service: KeycloakAuthServiceService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [KeycloakAuthServiceService],
        }).compile();

        service = module.get<KeycloakAuthServiceService>(KeycloakAuthServiceService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
