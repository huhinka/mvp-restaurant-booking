"use client";

import { CancelReservationDialog } from "@/components/cancel-reservation-dialog";
import { DateTimePicker } from "@/components/date-time-picker";
import { Pagination } from "@/components/pagination";
import StaffRoute from "@/components/staff-route";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  APPROVE_RESERVATION,
  CANCEL_RESERVATION,
  COMPLETE_RESERVATION,
  GET_RESERVATIONS,
} from "@/queries/reservation";
import { statusVariant } from "@/types/reservation";
import { useMutation, useQuery } from "@apollo/client";
import { endOfDay, format, startOfDay } from "date-fns";
import { useState } from "react";

interface FilterState {
  startDate?: Date;
  endDate?: Date;
  statuses: string[];
}

interface Reservation {
  id: string;
  guestName: string;
  email: string;
  phone: string;
  arrivalTime: string;
  tableSize: number;
  status: string;
  cancellationReason: string | null;
  createdAt: string;
  user: User;
}
interface User {
  id: string;
  email: string;
  phone: string;
  role: string;
}

export default function Reservations() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filter, setFilter] = useState<FilterState>({
    statuses: [],
  });
  const { toast } = useToast();

  const { data, loading, error, refetch } = useQuery(GET_RESERVATIONS, {
    variables: {
      page,
      limit,
      filter: {
        startDate: filter.startDate
          ? startOfDay(filter.startDate).toISOString()
          : undefined,
        endDate: filter.endDate
          ? endOfDay(filter.endDate).toISOString()
          : undefined,
        statuses: filter.statuses.length ? filter.statuses : undefined,
      },
    },
    fetchPolicy: "cache-and-network",
  });

  const [approveReservation] = useMutation(APPROVE_RESERVATION);
  const [completeReservation] = useMutation(COMPLETE_RESERVATION);
  const [cancelReservation] = useMutation(CANCEL_RESERVATION);

  const handleAction = async (
    action: "approve" | "complete" | "cancel",
    id: string,
    reason?: string,
  ) => {
    try {
      let mutation;
      switch (action) {
        case "approve":
          mutation = approveReservation;
          break;
        case "complete":
          mutation = completeReservation;
          break;
        case "cancel":
          mutation = cancelReservation;
          break;
      }

      await mutation({
        variables: { id, ...(reason && { reason }) },
      });

      toast({ title: `操作成功` });
      refetch();
    } catch (error) {
      toast({
        title: "操作失败",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = (status: string) => {
    setFilter((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status],
    }));
    setPage(1); // 重置到第一页
  };

  return (
    <StaffRoute>
      <div className="p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">预约管理</h1>

        {/* 筛选工具栏 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* 时间筛选 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">时间范围</Label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Label className="w-16">开始:</Label>
                <DateTimePicker
                  value={filter.startDate}
                  onChange={(date) =>
                    setFilter((p) => ({ ...p, startDate: date }))
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="w-16">结束:</Label>
                <DateTimePicker
                  value={filter.endDate}
                  onChange={(date) =>
                    setFilter((p) => ({ ...p, endDate: date }))
                  }
                />
              </div>
            </div>
          </div>

          {/* 状态筛选 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">预约状态</Label>
            <div className="grid grid-cols-2 gap-2">
              {["REQUESTED", "APPROVED", "COMPLETED", "CANCELLED"].map(
                (status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={filter.statuses.includes(status)}
                      onCheckedChange={() => handleStatusChange(status)}
                    />
                    <Label
                      htmlFor={`status-${status}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {status.toLowerCase()}
                    </Label>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        {/* 数据表格 */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "ID",
                  "姓名",
                  "联系方式",
                  "预约时间",
                  "人数",
                  "申请人联系方式",
                  "状态",
                  "操作",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-sm font-medium"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: limit }).map((_, i) => (
                  <tr key={i} className="border-t">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-red-500"
                  >
                    {error.message}
                  </td>
                </tr>
              ) : data?.reservations.items.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    未找到符合条件的预约
                  </td>
                </tr>
              ) : (
                data?.reservations.items.map((reservation: Reservation) => (
                  <tr
                    key={reservation.id}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">{reservation.id}</td>
                    <td className="px-4 py-3">{reservation.guestName}</td>
                    <td className="px-4 py-3">
                      <div>{reservation.email}</div>
                      <div>{reservation.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      {format(
                        new Date(reservation.arrivalTime),
                        "yyyy-MM-dd HH:mm",
                      )}
                    </td>
                    <td className="px-4 py-3">{reservation.tableSize}人</td>
                    <td className="px-4 py-3">
                      <div>{reservation.user.email}</div>
                      <div>{reservation.user.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={statusVariant[reservation.status] || "outline"}
                      >
                        {reservation.status.toLowerCase()}
                      </Badge>
                    </td>
                    <td className="p-4 space-x-2">
                      {reservation.status === "REQUESTED" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleAction("approve", reservation.id)
                            }
                          >
                            确认
                          </Button>
                          <CancelReservationDialog
                            reservationId={reservation.id}
                            currentStatus={reservation.status}
                            onSuccess={refetch}
                          />
                        </>
                      )}
                      {reservation.status === "APPROVED" && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              handleAction("complete", reservation.id)
                            }
                          >
                            完成
                          </Button>
                          <CancelReservationDialog
                            reservationId={reservation.id}
                            currentStatus={reservation.status}
                            onSuccess={refetch}
                          />
                        </>
                      )}
                      {!["REQUESTED", "APPROVED"].includes(
                        reservation.status,
                      ) && <span className="text-gray-400">无可用操作</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {data && (
          <Pagination
            current={page}
            total={data.reservations.pageInfo.totalItems}
            pageSize={limit}
            onChange={(newPage, newLimit) => {
              setPage(newPage);
              setLimit(newLimit);
            }}
          />
        )}
      </div>
    </StaffRoute>
  );
}
