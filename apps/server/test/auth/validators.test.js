import { expect } from "chai";
import sinon from "sinon";
import {
  loginValidator,
  registerValidator,
} from "../../src/auth/validators.js";
import { AppError } from "../../src/infrastructure/error.js";

describe("Validation Middlewares", () => {
  let sandbox;
  let req, res, next;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = { body: {} };
    res = {};
    next = sandbox.spy();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("registerValidator", () => {
    it("should pass with valid parameters", () => {
      req.body = {
        email: "test@example.com",
        password: "validpassword123",
      };
      registerValidator(req, res, next);
      expect(next.calledOnceWithExactly()).to.be.true;
    });

    it("should pass with valid phone", () => {
      req.body = {
        email: "test@example.com",
        password: "validpassword123",
        phone: "13912341234",
      };
      registerValidator(req, res, next);
      expect(next.calledOnceWithExactly()).to.be.true;
    });

    it("should error with invalid email", () => {
      req.body = {
        email: "invalid-email",
        password: "password123",
      };
      registerValidator(req, res, next);
      const error = next.args[0][0];
      expect(error).to.be.instanceOf(AppError);
      expect(error.message).to.equal("参数错误");
      expect(error.errors.email[0]).to.equal("请输入有效的邮箱");
    });

    it("should error with short password", () => {
      req.body = {
        email: "test@example.com",
        password: "short",
      };
      registerValidator(req, res, next);
      const error = next.args[0][0];
      expect(error.message).to.equal("参数错误");
      expect(error.errors.password[0]).to.equal("密码长度不能小于8位");
    });

    it("should error with invalid phone", () => {
      req.body = {
        email: "test@example.com",
        password: "password123",
        phone: "invalid-phone",
      };
      registerValidator(req, res, next);
      const error = next.args[0][0];
      expect(error.message).to.equal("参数错误");
      expect(error.errors.phone[0]).to.equal("请输入有效的手机号码");
    });

    it("should multiple errors with invalid email and password", () => {
      req.body = {};
      registerValidator(req, res, next);
      const error = next.args[0][0];
      expect(error.message).to.equal("参数错误");
      expect(error.errors.email[0]).to.include("请输入邮箱");
      expect(error.errors.password[0]).to.include("请输入密码");
    });
  });

  describe("loginValidator", () => {
    it("should pass with valid email", () => {
      req.body = {
        identifier: "test@example.com",
        password: "password123",
      };
      loginValidator(req, res, next);
      expect(next.calledOnceWithExactly()).to.be.true;
    });

    it("should pass with valid phone", () => {
      req.body = {
        identifier: "+1234567890",
        password: "password123",
      };
      loginValidator(req, res, next);
      expect(next.calledOnceWithExactly()).to.be.true;
    });

    it("should error with invalid identifier", () => {
      req.body = {
        identifier: "invalid",
        password: "password123",
      };
      loginValidator(req, res, next);
      const error = next.args[0][0];
      expect(error.message).to.equal("参数错误");
      expect(error.errors.identifier[0]).to.equal("请输入有效的邮箱或手机号码");
    });

    it("should error without password", () => {
      req.body = {
        identifier: "test@example.com",
      };
      loginValidator(req, res, next);
      const error = next.args[0][0];
      expect(error.message).to.equal("参数错误");
      expect(error.errors.password[0]).to.equal("请输入密码");
    });

    it("should error without identifier", () => {
      req.body = {
        password: "password123",
      };
      loginValidator(req, res, next);
      const error = next.args[0][0];
      expect(error.message).to.equal("参数错误");
      expect(error.errors.identifier[0]).to.equal("请输入有效的邮箱或手机号码");
    });
  });
});
