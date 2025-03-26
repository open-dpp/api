import { Test, TestingModule } from '@nestjs/testing';
import { ProductDataModelImportService } from './product.data.model.import.service';
import { ProductDataModelService } from './product.data.model.service';
import { ProductDataModel } from '../domain/product.data.model';
import { ProductDataModelEntity } from './product.data.model.entity';

describe('ProductDataModelImportService', () => {
  let service: ProductDataModelImportService;
  let productDataModelService: ProductDataModelService;

  // Create mock data
  const mockProductEntity: Partial<ProductDataModelEntity> = {
    id: 'test-id',
    name: 'Standard Laptop',
    version: '1.0.0',
    sections: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductDataModelImportService,
        {
          provide: ProductDataModelService,
          useValue: {
            findAll: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductDataModelImportService>(
      ProductDataModelImportService,
    );
    productDataModelService = module.get<ProductDataModelService>(
      ProductDataModelService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onApplicationBootstrap', () => {
    it('should not create a standard laptop model if it already exists', async () => {
      // Mock that the model already exists
      const findAllSpy = jest
        .spyOn(productDataModelService, 'findAll')
        .mockResolvedValue([mockProductEntity as ProductDataModelEntity]);

      await service.onApplicationBootstrap();

      expect(findAllSpy).toHaveBeenCalledWith({
        name: 'Standard Laptop',
      });
      expect(productDataModelService.save).not.toHaveBeenCalled();
    });

    it('should create a standard laptop model if it does not exist', async () => {
      // Mock that the model does not exist
      const findAllSpy = jest
        .spyOn(productDataModelService, 'findAll')
        .mockResolvedValue([]);

      // Mock the save method
      const saveSpy = jest
        .spyOn(productDataModelService, 'save')
        .mockImplementation(async (model) => model);

      // Spy on ProductDataModel.fromPlain
      const fromPlainSpy = jest.spyOn(ProductDataModel, 'fromPlain');

      await service.onApplicationBootstrap();

      expect(findAllSpy).toHaveBeenCalledWith({
        name: 'Standard Laptop',
      });

      // Verify that fromPlain was called with the correct data
      expect(fromPlainSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Standard Laptop',
          version: '1.0.0',
          sections: expect.arrayContaining([
            expect.objectContaining({
              name: 'Technische Spezifikation',
              type: 'Group',
              dataFields: expect.arrayContaining([
                expect.objectContaining({
                  name: 'Prozessor',
                  type: 'TextField',
                }),
                expect.objectContaining({
                  name: 'Arbeitsspeicher',
                  type: 'TextField',
                }),
              ]),
            }),
            expect.objectContaining({
              name: 'Material',
              type: 'Repeatable',
              dataFields: expect.arrayContaining([
                expect.objectContaining({
                  name: 'Materialnummer',
                  type: 'TextField',
                }),
                expect.objectContaining({
                  name: 'Materialanteil',
                  type: 'TextField',
                }),
              ]),
            }),
          ]),
        }),
      );

      // Verify that save was called with a ProductDataModel instance
      expect(saveSpy).toHaveBeenCalled();
      const saveArg = saveSpy.mock.calls[0][0];
      expect(saveArg).toBeInstanceOf(ProductDataModel);
    });
  });
});
