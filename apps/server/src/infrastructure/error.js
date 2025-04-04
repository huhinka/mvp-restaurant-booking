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
   * @param {object} [errors={}] 字段级错误 { field: [messages]}
   */
  constructor(message, statusCode, errors = {}) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }

  /**
   * 从 Joi 错误创建 AppError
   * @param {ValidationError} joiError - Joi 校验错误对象
   * @returns {AppError}
   */
  static fromJoi(joiError) {
    const errors = {};
    joiError.details.forEach((detail) => {
      const key = detail.path[0];
      if (!errors[key]) {
        errors[key] = [];
      }
      errors[key].push(detail.message);
    });

    return new AppError("参数错误", 400, errors);
  }
}
