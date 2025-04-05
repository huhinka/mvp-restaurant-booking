"use client";

import * as React from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarProps {
  selected?: Date;
  onSelect: (date: Date) => void;
}

export function Calendar({ selected, onSelect }: CalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(dayjs());

  // 生成当月日期网格
  const daysInMonth = currentDate.daysInMonth();
  const firstDayOfMonth = currentDate.startOf("month").day();

  // 生成日期数组
  const dates = Array.from({ length: daysInMonth }, (_, i) =>
    currentDate.startOf("month").add(i, "day"),
  );

  // 空白填充
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <div className="w-[300px] rounded-md border p-4">
      {/* 头部导航 */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentDate(currentDate.subtract(1, "month"))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-medium">{currentDate.format("YYYY年MM月")}</div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentDate(currentDate.add(1, "month"))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* 星期标题 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["日", "一", "二", "三", "四", "五", "六"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium h-8 flex items-center justify-center"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 日期网格 */}
      <div className="grid grid-cols-7 gap-1">
        {emptyDays.map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {dates.map((date) => (
          <Button
            key={date.format("YYYY-MM-DD")}
            variant={date.isSame(selected, "day") ? "default" : "ghost"}
            size="sm"
            className="h-8"
            onClick={() => onSelect(date.toDate())}
          >
            {date.date()}
          </Button>
        ))}
      </div>
    </div>
  );
}
