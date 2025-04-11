import {
  ArgumentsHost,
  BadRequestException,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { AppException } from './app.exception';

export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name);
  /**
   * 捕获应用全局异常并返回统一的响应
   *
   * @param exception AppException App 全局异常
   * @param host 上下文
   */
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    let errors: Record<string, string[]> = {};

    if (exception instanceof AppException) {
      status = exception.statusCode;
      message = exception.message;
      errors = exception.errors;
    } else if (exception instanceof BadRequestException) {
      status = HttpStatus.BAD_REQUEST;
      message = '校验错误';
      errors = this.formatValidationErrors(exception.getResponse() as any);
    } else if (exception instanceof Error) {
      message = exception.message;

      this.logger.error(`未处理的错误：${exception.stack}`);
    }

    response.status(status).json({
      message: message,
      errors: errors,
    });
  }

  /**
   * 格式化验证错误信息
   *
   * @param response 响应对象
   * @returns 格式化后的错误信息对象
   */
  private formatValidationErrors(response: any): Record<string, string[]> {
    if (response && response.message && Array.isArray(response.message)) {
      return response.message.reduce(
        (acc, error) => {
          if (error.constraints) {
            acc[error.property] = Object.values(error.constraints);
          }
          return acc;
        },
        {} as Record<string, string[]>,
      );
    }
    return {};
  }
}
