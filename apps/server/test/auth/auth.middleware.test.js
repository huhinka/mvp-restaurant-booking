import jwt from "jsonwebtoken";
import { afterEach, before, describe, it } from "mocha";
import sinon from "sinon";
import { AuthError, ForbiddenError } from "../../src/auth/auth.error.js";
import { auth } from "../../src/auth/auth.middleware.js";
import { User } from "../../src/auth/user.model.js";
import { expect } from "../test.helper.js";

describe("Auth Middleware", () => {
  const secret = "test-secret";
  let sandbox;

  before(() => {
    process.env.JWT_SECRET = secret;
    sandbox = sinon.createSandbox();
  });

  afterEach(() => sandbox.restore());

  const mockRequest = (token) => ({
    headers: {
      authorization: token ? `Bearer ${token}` : undefined,
    },
  });

  const mockResponse = () => ({
    status: sinon.stub().returnsThis(),
    json: sinon.stub(),
  });

  it("should validate Authorization header", async () => {
    const user = { _id: "user123", role: "guest" };
    const token = jwt.sign({ userId: user._id }, secret);

    sandbox.stub(User, "findById").resolves(user);
    const mockNext = sinon.stub();

    await auth()(mockRequest(token), mockResponse(), mockNext);

    expect(mockNext.calledOnce).to.be.true;
  });

  it("should reject invalid token", async () => {
    const res = mockResponse();
    const mockNext = sinon.stub();

    await expect(
      auth()(mockRequest("invalid-token"), res, mockNext),
    ).to.be.rejectedWith(AuthError, /^无效的 Token$/);
  });

  it("should handle expired token", async () => {
    const mockNext = sinon.stub();
    const expiredToken = jwt.sign({ userId: "user123" }, secret, {
      expiresIn: "-1h",
    });

    const res = mockResponse();
    await expect(
      auth()(mockRequest(expiredToken), res, mockNext),
    ).to.be.rejectedWith(AuthError, /^Token 已过期$/);
  });

  it("should validate staff role", async () => {
    const user = { _id: "staff123", role: "staff" };
    const token = jwt.sign({ userId: user._id }, secret);

    sandbox.stub(User, "findById").resolves(user);
    const mockNext = sinon.stub();

    await auth(["staff"])(mockRequest(token), mockResponse(), mockNext);
    expect(mockNext.calledOnce).to.be.true;
  });

  it("should reject unauthorized role", async () => {
    const user = { _id: "guest123", role: "guest" };
    const token = jwt.sign({ userId: user._id }, secret);

    sandbox.stub(User, "findById").resolves(user);
    const res = mockResponse();
    const mockNext = sinon.stub();

    await expect(
      auth(["staff"])(mockRequest(token), res, mockNext),
    ).to.be.rejectedWith(ForbiddenError, /^Forbidden$/);
  });

  it("should handle user not found", async () => {
    sandbox.stub(User, "findById").resolves(null);
    const res = mockResponse();
    const mockNext = sinon.stub();

    await expect(
      auth()(mockRequest("valid-token"), res, mockNext),
    ).to.be.rejectedWith(AuthError, /^无效的 Token$/);
  });
});
