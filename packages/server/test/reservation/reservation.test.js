import { describe, before, beforeEach, it } from "mocha";
import { expect } from "chai";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../src/app.js";
import { Reservation } from "../../src/reservation/reservation.model.js";
import { User } from "../../src/auth/user.model.js";

describe("Reservation API", () => {
  let guestToken, staffToken, testReservation;

  before(async () => {
    const [guest, staff] = await Promise.all([
      User.create({ email: "guest@test.com", password: "pass", role: "guest" }),
      User.create({ email: "staff@test.com", password: "pass", role: "staff" }),
    ]);

    guestToken = jwt.sign({ userId: guest._id }, process.env.JWT_SECRET);
    staffToken = jwt.sign({ userId: staff._id }, process.env.JWT_SECRET);
  });

  beforeEach(async () => {
    const user = await User.findOne({ email: "guest@test.com" });
    const userId = user._id;
    testReservation = await Reservation.create({
      guestName: "Test User",
      phone: "1234567890",
      email: "test@test.com",
      arrivalTime: new Date(Date.now() + 24 * 3600 * 1000),
      partySize: 4,
      user: userId,
    });
  });

  async function guestQuery(query) {
    return await queryGraphQL(guestToken, query);
  }

  async function staffQuery(query) {
    return await queryGraphQL(staffToken, query);
  }

  describe("Guest", () => {
    it("could create a reservation", async () => {
      const res = await guestQuery(`
            mutation CreateReservation{
              createReservation(input: {
                guestName: "Test User",
                email: "new@test.com",
                phone: "0987654321",
                arrivalTime: "${new Date(
                  Date.now() + 24 * 3600 * 1000
                ).toISOString()}",
                partySize: 2
              }) {
                id
                status
              }
            }
        `);

      expect(res.status).to.equal(200);
      expect(res.body.data.createReservation.status).to.equal("REQUESTED");
    });

    it("could not approve a reservation", async () => {
      const res = await guestQuery(`
            mutation ApproveReservation{
              approveReservation(id: "${testReservation._id}") {
                id
                status
              }
            }
      `);

      expect(res.status).to.equal(200);
      expect(res.body.errors[0].message).to.match(/权限不足/i);
    });
  });

  describe("Staff", () => {
    it("could approve a reservation", async () => {
      const res = await staffQuery(`
            mutation ApproveReservation{
              approveReservation(id: "${testReservation._id}") {
                id
                status
              }
            }
      `);

      expect(res.status).to.equal(200);
      expect(res.body.data.approveReservation.status).to.equal("APPROVED");
    });

    it("could not approve a reservation that status is not REQUESTED", async () => {
      testReservation.status = "CANCELLED";
      testReservation.save();

      const res = await staffQuery(`
            mutation ApproveReservation{
              approveReservation(id: "${testReservation._id}") {
                id
                status
              }
            }
      `);

      expect(res.status).to.equal(200);
      expect(res.body.errors[0].message).to.match(
        /无法从 CANCELLED 变更为 APPROVED/i
      );
    });
  });
});

async function queryGraphQL(token, query) {
  return await request(app)
    .post("/reservation")
    .set("Authorization", `Bearer ${token}`)
    .send({ query });
}
