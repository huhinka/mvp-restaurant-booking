import { gql } from "@apollo/client";

export const GET_MY_RESERVATIONS = gql`
  query GetMyReservations {
    myReservations {
      id
      guestName
      phone
      email
      arrivalTime
      partySize
      status
    }
  }
`;
