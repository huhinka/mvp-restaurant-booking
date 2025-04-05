// app/staff/reservations/page.tsx
"use client";

import { Calendar } from "@/components/calendar";
import { Pagination } from "@/components/pagination";
import StaffRoute from "@/components/staff-route";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { GET_RESERVATIONS } from "@/queries/reservation";
import { useQuery } from "@apollo/client";
import { endOfDay, format, startOfDay } from "date-fns";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { statusVariant } from "@/types/reservation";
import { Label } from "@/components/ui/label";
import { DateTimePicker } from "@/components/date-time-picker";

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
}

export default function ReservationsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filter, setFilter] = useState<FilterState>({
    statuses: [],
  });

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
                {["姓名", "联系方式", "预约时间", "人数", "状态"].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left text-sm font-medium"
                    >
                      {header}
                    </th>
                  ),
                )}
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
                      <Badge
                        variant={statusVariant[reservation.status] || "outline"}
                      >
                        {reservation.status.toLowerCase()}
                      </Badge>
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
