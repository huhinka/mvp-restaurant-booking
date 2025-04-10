import { ArgumentsHost } from '@nestjs/common';
import { AppExceptionFilter } from './app-exception.filter';
import { AppException } from './app.exception';

describe('AppExceptionFilter', () => {
  let filter: AppExceptionFilter;
  let mockResponse: Partial<Record<string, jest.Mock>>;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(() => {
    filter = new AppExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockArgumentsHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;
  });

  it('should set status code and response body for AppException', () => {
    const exception = new AppException('Test error', 400, {
      field: ['Error message'],
    });

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(exception.statusCode);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: exception.message,
      errors: exception.errors,
    });
  });
});
