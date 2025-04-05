export const reservationSchema = `#graphql
  type Query {
    myReservations(page: Int, limit: Int): ReservationPagination!
    reservations(page: Int, limit: Int, filter: ReservationFilterInput): ReservationPagination!
    me: User!
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

  type PageInfo {       
    totalItems: Int!    
    currentPage: Int!   
    itemsPerPage: Int!  
    totalPages: Int!    
    hasNextPage: Boolean! 
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

  type ReservationPagination {
    items: [Reservation!]!
    pageInfo: PageInfo!
  }

  type User {
    id: ID!
    email: String!
    phone: String!
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

  input ReservationFilterInput {
    startDate: DateTime
    endDate: DateTime
    statuses: [ReservationStatus!]
  }
`;
