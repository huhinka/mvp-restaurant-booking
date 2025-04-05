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

const statusVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  REQUESTED: "secondary",
  APPROVED: "default",
  CANCELLED: "destructive",
  COMPLETED: "outline",
};

export default function MyReservations() {
  const { data, loading, error } = useQuery(GET_MY_RESERVATIONS);

  return (
    <AuthRoute>
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">我的预约</h1>

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
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
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
              ) : data?.myReservations?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    暂无预约记录
                  </TableCell>
                </TableRow>
              ) : (
                data?.myReservations?.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell className="font-medium">
                      #{reservation.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>{reservation.guestName}</TableCell>
                    <TableCell>{reservation.guestPhone}</TableCell>
                    <TableCell>
                      {format(
                        new Date(reservation.expectedArrivalTime),
                        "yyyy-MM-dd HH:mm",
                      )}
                    </TableCell>
                    <TableCell>{reservation.partySize}人</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={statusVariant[reservation.status] || "outline"}
                      >
                        {reservation.status.toLowerCase()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AuthRoute>
  );
}
