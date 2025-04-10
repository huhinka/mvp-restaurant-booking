import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { AppException } from './app.exception';

export class AppExceptionFilter implements ExceptionFilter {
  /**
   * 捕获应用全局异常并返回统一的响应
   *
   * @param exception AppException App 全局异常
   * @param host 上下文
   */
  catch(exception: AppException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception.statusCode;

    response.status(status).json({
      message: exception.message,
      errors: exception.errors,
    });
  }
}
