export const reservationSchema = `#graphql
  type Query {
    _empty: String
  }

  type Mutation {
    createReservation(input: ReservationInput!): Reservation!
    updateReservation(id: ID!, input: ReservationUpdateInput!): Reservation!
    cancelReservation(id: ID!): Reservation!
    approveReservation(id: ID!): Reservation!
    completeReservation(id: ID!): Reservation!
  }

  scalar DateTime

  enum ReservationStatus {
    REQUESTED
    APPROVED
    CANCELLED
    COMPLETED
  }

  type Reservation {
    id: ID!
    guestName: String!
    email: String!
    phone: String!
    arrivalTime: DateTime!
    partySize: Int!
    status: ReservationStatus!
    user: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input ReservationInput {
    guestName: String!
    email: String!
    phone: String!
    arrivalTime: String!
    partySize: Int!
  }

  input ReservationUpdateInput {
    guestName: String
    email: String
    phone: String
    arrivalTime: String
    partySize: Int
  }
`;
