import { describe, before, afterEach, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import jwt from "jsonwebtoken";
import { auth } from "../../src/auth/auth.middleware.js";
import { User } from "../../src/auth/user.model.js";

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
    await auth()(mockRequest("invalid-token"), res, mockNext);

    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.args[0][0].error).to.match(/Authentication failed/i);
  });

  it("should validate staff role", async () => {
    const user = { _id: "staff123", role: "staff" };
    const token = jwt.sign({ userId: user._id }, secret);

    sandbox.stub(User, "findById").resolves(user);
    const mockNext = sinon.stub();

    await auth(["staff"])(mockRequest(token), mockResponse(), mockNext);
    expect(mockNext.calledOnce).to.be.true;
  });

  it("should handle expired token", async () => {
    const mockNext = sinon.stub();
    const expiredToken = jwt.sign({ userId: "user123" }, secret, {
      expiresIn: "-1h",
    });

    const res = mockResponse();
    await auth()(mockRequest(expiredToken), res, mockNext);

    expect(res.json.args[0][0].details).to.equal("Token expired");
  });
});
