import { expect } from "chai";
import sinon from "sinon";
import errorHandler from "../../src/infrastructure/error-handler.js";
import { AppError } from "../../src/infrastructure/error.js";

describe("Global Error Handler", () => {
  let sandbox;

  before(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should return AppError status code and message", () => {
    const statusCode = 403;
    const message = "校验错误";
    const errors = { email: ["邮箱格式不正确"] };
    const err = new AppError(message, statusCode, errors);

    const res = {
      status: sandbox.stub().returnsThis(),
      json: sandbox.spy(),
    };

    errorHandler(err, {}, res, () => {});

    expect(res.status.calledOnceWith(statusCode)).to.be.true;
    expect(
      res.json.calledOnceWith({
        message,
        errors,
      })
    ).to.be.true;
  });

  it("should 500 with internal server error", () => {
    const err = new Error("未定义错误");
    const req = {
      method: "GET",
      path: "/foo",
    };
    const res = {
      status: sandbox.stub().returnsThis(),
      json: sandbox.stub(),
    };

    errorHandler(err, req, res, () => {});

    expect(res.status.calledOnceWith(500)).to.be.true;
    expect(
      res.json.calledOnceWith({
        message: "Internal Server Error",
      })
    ).to.be.true;
  });
});
