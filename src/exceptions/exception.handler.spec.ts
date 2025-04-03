import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundInDatabaseExceptionFilter } from './exception.handler';
import { NotFoundInDatabaseException } from './service.exceptions';
import { ArgumentsHost, HttpStatus } from '@nestjs/common';

describe('NotFoundInDatabaseExceptionFilter', () => {
  let filter: NotFoundInDatabaseExceptionFilter;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockResponse: any;
  let mockRequest: any;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(async () => {
    // Set up mock response and request
    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockResponse = { status: mockStatus };
    mockRequest = { url: '/test-url' };

    // Set up mock ArgumentsHost
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ArgumentsHost;

    // Set up the filter
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotFoundInDatabaseExceptionFilter],
    }).compile();

    filter = module.get<NotFoundInDatabaseExceptionFilter>(
      NotFoundInDatabaseExceptionFilter,
    );

    // Mock Date.toISOString for consistent testing
    jest
      .spyOn(Date.prototype, 'toISOString')
      .mockReturnValue('2025-03-26T12:00:00.000Z');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should transform NotFoundInDatabaseException to a proper HTTP response', () => {
    // Create a NotFoundInDatabaseException
    const exception = new NotFoundInDatabaseException('TestEntity');

    // Call the filter
    filter.catch(exception as any, mockArgumentsHost);

    // Verify the ArgumentsHost was used correctly
    expect(mockArgumentsHost.switchToHttp).toHaveBeenCalled();
    expect(mockArgumentsHost.switchToHttp().getResponse).toHaveBeenCalled();
    expect(mockArgumentsHost.switchToHttp().getRequest).toHaveBeenCalled();

    // Verify the response status was set to 404
    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);

    // Verify the JSON response has the correct format
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      timestamp: '2025-03-26T12:00:00.000Z',
      path: '/test-url',
      message: 'TestEntity could not be found.',
    });
  });

  it('should include the correct error message in the response', () => {
    // Create a NotFoundInDatabaseException with a specific entity name
    const exception = new NotFoundInDatabaseException('CustomEntity');

    // Call the filter
    filter.catch(exception as any, mockArgumentsHost);

    // Verify the JSON response has the correct message
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'CustomEntity could not be found.',
      }),
    );
  });
});
