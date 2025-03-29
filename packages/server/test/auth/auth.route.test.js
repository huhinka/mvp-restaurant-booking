import { describe, beforeEach, it } from "mocha";
import { expect } from "chai";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../src/app.js";
import { User } from "../../src/auth/user.model.js";

describe("Authentication API", () => {
  const testUser = {
    email: "test@example.com",
    password: "ValidPass123!",
  };

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("POST /auth/register", () => {
    it("should return valid token when registering a new user (201)", async () => {
      const res = await request(app).post("/auth/register").send(testUser);

      expect(res.status).to.equal(201);
      expect(res.body).to.include.keys("token", "userId", "role");

      const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
      expect(decoded.userId).to.equal(res.body.userId);
    });

    it("should 400 with invalid email", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({ ...testUser, email: "invalid-email" });

      expect(res.status).to.equal(400);
      expect(res.body.error).to.match(/"email" must be a valid email/i);
    });
  });

  describe("POST /auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/auth/register").send(testUser);
    });

    it("should 200 with valid token", async () => {
      const res = await request(app).post("/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.status).to.equal(200);
      expect(res.body.token).to.be.a("string");
    });

    it("should 401 with wrong password", async () => {
      const res = await request(app).post("/auth/login").send({
        email: testUser.email,
        password: "wrong-password",
      });

      expect(res.status).to.equal(401);
      expect(res.body.error).to.match(/invalid credentials/i);
    });
  });
});
