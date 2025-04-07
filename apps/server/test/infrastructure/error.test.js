import { expect } from "chai";
import sinon from "sinon";
import { AppError } from "../../src/infrastructure/error.js";

describe("AppError", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe(".fromJoi()", () => {
    it("should handle single field error", () => {
      const mockJoiError = {
        details: [
          {
            path: ["email"],
            message: "邮箱不能为空",
          },
        ],
      };

      const result = AppError.fromJoi(mockJoiError);

      expect(result).to.be.instanceOf(AppError);
      expect(result.statusCode).to.equal(400);
      expect(result.message).to.equal("参数错误");
      expect(result.errors).to.deep.equal({
        email: ["邮箱不能为空"],
      });
    });

    it("should handle multiple errors in one field", () => {
      const mockJoiError = {
        details: [
          { path: ["password"], message: "密码不能为空" },
          { path: ["password"], message: "密码长度不足" },
        ],
      };

      const result = AppError.fromJoi(mockJoiError);

      expect(result.errors.password).to.have.lengthOf(2);
      expect(result.errors.password).to.include.members([
        "密码不能为空",
        "密码长度不足",
      ]);
    });

    it("should handle multiple fields", () => {
      const mockJoiError = {
        details: [
          { path: ["email"], message: "邮箱格式错误" },
          { path: ["phone"], message: "手机号格式错误" },
        ],
      };

      const result = AppError.fromJoi(mockJoiError);

      expect(result.errors).to.have.keys(["email", "phone"]);
      expect(result.errors.email).to.include("邮箱格式错误");
      expect(result.errors.phone).to.include("手机号格式错误");
    });

    it("should handle empty details", () => {
      const mockJoiError = { details: [] };

      // 虽然 Joi 不会返回空 details，但测试边界情况
      const result = AppError.fromJoi(mockJoiError);
      expect(result.errors).to.deep.equal({});
    });
  });
});
