/**
 * 全局应用异常
 *
 * 所有的应用逻辑异常应该继承此异常类
 */
export class AppException extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
  }
}
