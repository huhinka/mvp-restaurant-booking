import { ArgumentsHost, BadRequestException, HttpStatus } from '@nestjs/common';
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

  it('should set status code and response body for BadRequestException', () => {
    const validationErrors = [
      {
        property: 'email',
        constraints: {
          isEmail: '邮件格式不正确',
        },
      },
      {
        property: 'password',
        constraints: {
          minLength: '至少 8 个字符',
        },
      },
    ];

    const exception = new BadRequestException({
      message: validationErrors,
      error: 'Bad Request',
    });

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: '校验错误',
      errors: {
        email: ['邮件格式不正确'],
        password: ['至少 8 个字符'],
      },
    });
  });

  it('should set status code and response body for undefined Error', () => {
    const exception = new Error('未定义错误');

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: exception.message,
      errors: {},
    });
  });

  it('should handle empty validation errors for BadRequestException', () => {
    const exception = new BadRequestException({
      message: [],
      error: 'Bad Request',
    });

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: '校验错误',
      errors: {},
    });
  });

  it('should handle unexpected response structure for BadRequestException', () => {
    const exception = new BadRequestException({
      message: 'Unexpected response structure',
      error: 'Bad Request',
    });

    filter.catch(exception, mockArgumentsHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: '校验错误',
      errors: {},
    });
  });
});
