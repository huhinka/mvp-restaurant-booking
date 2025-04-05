import { gql } from "@apollo/client";

export const GET_MY_RESERVATIONS = gql`
  query GetMyReservations($page: Int!, $limit: Int!) {
    myReservations(page: $page, limit: $limit) {
      items {
        id
        guestName
        phone
        email
        arrivalTime
        tableSize
        status
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
`;

export const UPDATE_RESERVATION = gql`
  mutation UpdateReservation($id: ID!, $input: ReservationUpdateInput!) {
    updateReservation(id: $id, input: $input) {
      id
      guestName
      email
      phone
      arrivalTime
      tableSize
      status
    }
  }
`;

export type ReservationUpdateInput = {
  guestName: string;
  email: string;
  phone: string;
  arrivalTime: string;
  tableSize: number;
};

export const CANCEL_RESERVATION = gql`
  mutation CancelReservation($id: ID!, $reason: String!) {
    cancelReservation(id: $id, reason: $reason) {
      id
      status
      cancellationReason
    }
  }
`;
