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
