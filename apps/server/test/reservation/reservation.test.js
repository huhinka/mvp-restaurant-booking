import { describe, before, beforeEach, afterEach, it } from "mocha";
import { expect } from "chai";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../src/app.js";
import { Reservation } from "../../src/reservation/reservation.model.js";
import { User } from "../../src/auth/user.model.js";

describe("Reservation API", () => {
  let guestToken, guest2Token, staffToken, testReservation;

  before(async () => {
    const [guest, guest2, staff] = await Promise.all([
      User.create({
        email: "guest@test.com",
        phone: "13612341234",
        password: "pass",
        role: "guest",
      }),
      User.create({
        email: "guest2@test.com",
        phone: "13912341234",
        password: "pass",
        role: "guest",
      }),
      User.create({
        email: "staff@test.com",
        phone: "13812341234",
        password: "pass",
        role: "staff",
      }),
    ]);

    guestToken = jwt.sign({ userId: guest._id }, process.env.JWT_SECRET);
    guest2Token = jwt.sign({ userId: guest2._id }, process.env.JWT_SECRET);
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
      tableSize: 4,
      user: userId,
    });
  });

  afterEach(async () => {
    await Reservation.deleteMany({});
  });

  async function guestQuery(query, variables = {}) {
    return await queryGraphQL(guestToken, query, variables);
  }

  async function staffQuery(query, variables = {}) {
    return await queryGraphQL(staffToken, query, variables);
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
                tableSize: 2
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

    it("could update reservation", async () => {
      const arrivalTime = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
      const res = await guestQuery(`
            mutation UpdateReservation{
              updateReservation(id: "${testReservation._id}", input: {
                guestName: "new value",
                email: "updated@test.com",
                phone: "1234567890",
                arrivalTime: "${arrivalTime}",
                tableSize: 3
              }) {
                guestName
                email
                phone
                arrivalTime
                tableSize
                }
            }`);

      expect(res.status).to.equal(200);
      const reservation = res.body.data.updateReservation;
      expect(reservation).is.not.null;
      expect(reservation.guestName).to.equal("new value");
      expect(reservation.email).to.equal("updated@test.com");
      expect(reservation.phone).to.equal("1234567890");
      expect(reservation.arrivalTime).to.equal(arrivalTime);
      expect(reservation.tableSize).to.equal(3);
    });

    it("could not update reservation with status APPROVED", async () => {
      testReservation.status = "APPROVED";
      testReservation.save();

      const res = await guestQuery(`
            mutation UpdateReservation{
              updateReservation(id: "${testReservation._id}", input: {
                tableSize: 3
              }) {
                tableSize
                }
            }`);

      expect(res.status).to.equal(200);
      expect(res.body.errors[0].message).to.match(/预约状态不正确/i);
    });

    it("could cancel reservation", async () => {
      const res = await guestQuery(
        `
            mutation CancelReservation($id: ID!, $reason: String!) {
                cancelReservation(id: $id, reason: $reason) {
                  id
                  status
                  cancellationReason
                }          
            }
        `,
        {
          id: testReservation._id,
          reason: "test reason",
        }
      );

      expect(res.status).to.equal(200);
      expect(res.body.data.cancelReservation.status).to.equal("CANCELLED");
      expect(res.body.data.cancelReservation.cancellationReason).to.equal(
        "test reason"
      );
    });

    it("could not cancel reservation not belong to the user", async () => {
      const res = await queryGraphQL(
        guest2Token,
        `
            mutation CancelReservation{
                cancelReservation(id: "${testReservation._id}", reason: "test reason") {
                  id
                  status
                }          
            }
        `
      );

      expect(res.status).to.equal(200);
      expect(res.body.errors[0].message).to.match(
        /找不到预约或您没有权限取消此预约/i
      );
    });

    it("could not complete a reservation by guest", async () => {
      const res = await guestQuery(`
            mutation CompleteReservation{
                completeReservation(id: "${testReservation._id}") {
                  id
                  status
                }
            }
        `);

      expect(res.status).to.equal(200);
      expect(res.body.errors[0].message).to.match(/权限不足/i);
    });

    it("could view guest owner reservations", async () => {
      const res = await guestQuery(`
            query Reservations{
              myReservations(page: 1, limit: 10) {
                items {
                  id
                  status
                  guestName
                  email
                  phone
                  arrivalTime
                  tableSize
                }
                pageInfo {
                  totalItems
                  currentPage
                  itemsPerPage
                  totalPages
                  hasNextPage
                }
              }
            }
        `);

      expect(res.status).to.equal(200);
      const result = res.body.data.myReservations;
      expect(result.items.length).to.equal(1);
      expect(result.pageInfo.totalItems).to.equal(1);
      expect(result.pageInfo.currentPage).to.equal(1);
      expect(result.pageInfo.itemsPerPage).to.equal(10);
      expect(result.pageInfo.totalPages).to.equal(1);
      expect(result.pageInfo.hasNextPage).to.be.false;
      expect(result.items[0].id).to.equal(testReservation._id.toString());
      expect(result.items[0].status).to.equal("REQUESTED");
      expect(result.items[0].guestName).to.equal("Test User");
      expect(result.items[0].email).to.equal("test@test.com");
      expect(result.items[0].phone).to.equal("1234567890");
      expect(result.items[0].tableSize).to.equal(4);
    });

    it("could view guest owner reservations with user info", async () => {
      const user = await User.findOne({ email: "guest@test.com" });

      const res = await guestQuery(`
            query Reservations{
              myReservations(page: 1, limit: 10) {
                items {
                  id
                  user {
                    id
                    email
                    phone
                    role
                  }
                }
              }
            }
        `);

      expect(res.status).to.equal(200);
      expect(res.body.data.myReservations.items[0].user.id).to.equal(user.id);
      expect(res.body.data.myReservations.items[0].user.email).to.equal(user.email);
      expect(res.body.data.myReservations.items[0].user.phone).to.equal(user.phone);
      expect(res.body.data.myReservations.items[0].user.role).to.equal(user.role);
    });

    it("could return empty list if no reservations", async () => {
      const res = await queryGraphQL(
        guest2Token,
        `
            query Reservations{
              myReservations(page: 1, limit: 10) {
                items {
                  id
                }
              }
            }
        `
      );

      expect(res.status).to.equal(200);
      expect(res.body.data.myReservations.items.length).to.equal(0);
    });

    it("could not view other guest reservations", async () => {
      const res = await guestQuery(
        `
            query Reservations{
              reservations(page: 1, limit: 10, filter: {}) {
                items {
                  id
                }
              }
            }
        `
      );

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

    it("could cancel a reservation", async () => {
      const res = await staffQuery(`
            mutation CancelReservation{
                cancelReservation(id: "${testReservation._id}", reason: "test") {
                  id
                  status
                  cancellationReason
                }          
            }
        `);

      expect(res.status).to.equal(200);
      expect(res.body.data.cancelReservation.status).to.equal("CANCELLED");
      expect(res.body.data.cancelReservation.cancellationReason).to.equal(
        "test"
      );
    });

    it("could complete a reservation", async () => {
      testReservation.status = "APPROVED";
      testReservation.save();

      const res = await staffQuery(`
            mutation CompleteReservation{
                completeReservation(id: "${testReservation._id}") {
                  id
                  status
                }
            }
        `);

      expect(res.status).to.equal(200);
      expect(res.body.data.completeReservation.status).to.equal("COMPLETED");
    });

    it("could complete a reservation that status is not APPROVED", async () => {
      testReservation.status = "REQUESTED";
      testReservation.save();

      const res = await staffQuery(`
            mutation CompleteReservation{
                completeReservation(id: "${testReservation._id}") {
                  id
                  status
                }
            }
        `);

      expect(res.status).to.equal(200);
      expect(res.body.errors[0].message).to.match(
        /无法从 REQUESTED 变更为 COMPLETED/i
      );
    });

    describe("Staff View Reservations", () => {
      beforeEach(async () => {
        const guest = await User.findOne({ email: "guest@test.com" });
        const baseTime = new Date("2025-03-10T00:00:00Z");

        async function createTestReservation(status, arrivalTime) {
          return await Reservation.create({
            status: status,
            arrivalTime: arrivalTime,
            guestName: "Test User",
            phone: "1234567890",
            email: "test@test.com",
            user: guest._id,
            tableSize: 4,
          });
        }

        await createTestReservation("APPROVED", new Date(baseTime.setDate(21)));
        await createTestReservation(
          "COMPLETED",
          new Date(baseTime.setDate(19))
        );
        await createTestReservation(
          "REQUESTED",
          // setHours will change the date, so we need to set the date first
          new Date(baseTime.setHours(10))
        );
      });

      it("could view all reservations filter by date and status", async () => {
        const guest = await User.findOne({ email: "guest@test.com" });

        const res = await staffQuery(
          `
            query Reservations ($statuses: [ReservationStatus!], $start: DateTime!, $end: DateTime!) {
              reservations(page: 1,
                  limit: 10, 
                  filter: {
                    startDate: $start, 
                    endDate: $end,
                    statuses: $statuses
                  }
                ) {
                  items {
                    id
                    status
                    guestName
                    email
                    phone
                    arrivalTime
                    tableSize
                    user {
                      id
                      email
                      phone
                      role
                    }
                  }
              }
            }
        `,
          {
            statuses: ["REQUESTED", "APPROVED"],
            start: "2025-03-10T00:00:00Z",
            end: "2025-03-20T23:59:59Z",
          }
        );

        expect(res.status).to.equal(200);
        expect(res.body.data.reservations.items.length).to.equal(1);
        expect(res.body.data.reservations.items[0].user.id).to.equal(guest.id);
        expect(res.body.data.reservations.items[0].user.email).to.equal(guest.email);
        expect(res.body.data.reservations.items[0].user.phone).to.equal(guest.phone);
        expect(res.body.data.reservations.items[0].user.role).to.equal(guest.role);
      });

      it("could view all reservations with no filter", async () => {
        const res = await staffQuery(
          `
            query Reservations ($statuses: [ReservationStatus!], $start: DateTime, $end: DateTime) {
              reservations(page: 1,
                  limit: 10, 
                  filter: {
                    startDate: $start, 
                    endDate: $end,
                    statuses: $statuses
                  }
                ) {
                  items {
                    id
                    status
                    guestName
                    email
                    phone
                    arrivalTime
                    tableSize
                  }
                }
            }
        `
        );

        expect(res.status).to.equal(200);
        expect(res.body.data.reservations.items.length).to.equal(4);
      });

      it("validate the edge of date range", async () => {
        const res = await staffQuery(
          `
            query Reservations ($statuses: [ReservationStatus!], $start: DateTime!, $end: DateTime!) {
              reservations(page: 1,
                  limit: 10, 
                  filter: {
                    startDate: $start, 
                    endDate: $end,
                    statuses: $statuses
                  }
                ) {
                  items {
                    id
                  }
              }
            }
          `,
          {
            start: "2025-03-19T00:00:00Z",
            end: "2025-03-19T00:00:00Z",
          }
        );

        expect(res.status).to.equal(200);
        expect(res.body.data.reservations.items.length).to.equal(1);
      });
    });
  });
});

async function queryGraphQL(token, query, variables = {}) {
  return await request(app)
    .post("/reservation")
    .set("Authorization", `Bearer ${token}`)
    .send({ query, variables });
}
