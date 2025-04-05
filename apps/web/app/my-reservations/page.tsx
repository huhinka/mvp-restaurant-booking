"use client";

import { useQuery } from "@apollo/client";
import { format } from "date-fns";
import { GET_MY_RESERVATIONS } from "@/queries/reservation";
import AuthRoute from "@/components/auth-route";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Pagination } from "@/components/pagination";
import { EditReservationDialog } from "@/components/edit-reservation-dialog";
import { CancelReservationDialog } from "@/components/cancel-reservation-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { statusVariant } from "@/types/reservation";

interface Reservation {
  id: string;
  guestName: string;
  email: string;
  phone: string;
  arrivalTime: string;
  tableSize: number;
  status: string;
}

const DEFAULT_PAGE_SIZE = 10;

export default function MyReservations() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);

  const { data, loading, error } = useQuery(GET_MY_RESERVATIONS, {
    variables: {
      page: currentPage,
      limit: limit,
    },
    fetchPolicy: "cache-and-network",
  });

  const handlePageChange = (newPage: number, newLimit: number) => {
    setCurrentPage(newPage);
    setLimit(newLimit);
  };

  return (
    <AuthRoute>
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">我的预约</h1>

        <Button asChild>
          <Link href="/book" className="gap-2">
            <Plus className="h-4 w-4" />
            新建预约
          </Link>
        </Button>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>预约 ID</TableHead>
                <TableHead>姓名</TableHead>
                <TableHead>联系电话</TableHead>
                <TableHead>预计到达时间</TableHead>
                <TableHead>人数</TableHead>
                <TableHead className="text-right">状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                Array.from({ length: limit }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[120px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[150px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[60px]" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-red-500">
                    加载失败: {error.message}
                  </TableCell>
                </TableRow>
              ) : data?.myReservations?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    暂无预约记录
                  </TableCell>
                </TableRow>
              ) : (
                data?.myReservations?.items.map((reservation: Reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell className="font-medium">
                      #{reservation.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>{reservation.guestName}</TableCell>
                    <TableCell>{reservation.phone}</TableCell>
                    <TableCell>
                      {format(
                        new Date(reservation.arrivalTime),
                        "yyyy-MM-dd HH:mm",
                      )}
                    </TableCell>
                    <TableCell>{reservation.tableSize}人</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={statusVariant[reservation.status] || "outline"}
                      >
                        {reservation.status.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <EditReservationDialog reservation={reservation} />
                      <CancelReservationDialog
                        reservationId={reservation.id}
                        currentStatus={reservation.status}
                        onSuccess={() => {}}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <Pagination
            current={currentPage}
            total={data?.myReservations?.pageInfo?.totalItems || 0}
            pageSize={limit}
            onChange={handlePageChange}
          />
        </div>
      </div>
    </AuthRoute>
  );
}
