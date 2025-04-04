/**
 * 应用级别错误。
 *
 * 这个错误应该被全局错误处理器捕获，并且仅处理用户错误，比如参数错误、权限错误等。
 */
export class AppError extends Error {
  /**
   * 构造函数。
   *
   * @param {string} message 错误信息
   * @param {number} statusCode 状态码，用户错误选用 400、401、403 等
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}
