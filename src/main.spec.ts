import { NestFactory } from '@nestjs/core';
import {
  NotFoundExceptionFilter,
  NotFoundInDatabaseExceptionFilter,
  ValueErrorFilter,
} from './exceptions/exception.handler';

// Mock NestFactory before importing bootstrap function
jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn().mockResolvedValue({
      useGlobalFilters: jest.fn(),
      enableCors: jest.fn(),
      useGlobalPipes: jest.fn(),
      listen: jest.fn().mockResolvedValue(undefined),
    }),
  },
}));

describe('Bootstrap', () => {
  let mockApp: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    const configServiceMock = {
      get: jest.fn().mockReturnValue('false'),
    };
    // Setup mock app
    mockApp = {
      get: jest.fn().mockReturnValue(configServiceMock),
      useGlobalFilters: jest.fn().mockReturnThis(),
      enableCors: jest.fn().mockReturnThis(),
      useGlobalPipes: jest.fn(),
      use: jest.fn(),
      listen: jest.fn().mockResolvedValue(undefined),
    };

    // Configure NestFactory.create to return our mock app
    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);
  });

  it('should set up the application with correct configurations', async () => {
    // Import the bootstrap function directly now
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { bootstrap } = require('./main');
    await bootstrap();

    // Verify the app is configured correctly
    expect(NestFactory.create).toHaveBeenCalled();

    expect(mockApp.useGlobalFilters).toHaveBeenCalledWith(
      expect.any(NotFoundInDatabaseExceptionFilter),
      expect.any(NotFoundExceptionFilter),
      expect.any(ValueErrorFilter),
    );

    expect(mockApp.enableCors).toHaveBeenCalledWith({
      origin: '*',
    });

    expect(mockApp.listen).toHaveBeenCalledWith(3000, '0.0.0.0');
  });
});
