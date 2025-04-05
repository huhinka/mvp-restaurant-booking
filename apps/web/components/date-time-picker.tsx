"use client";

import { Calendar } from "@/components/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { Calendar as CalendarIcon } from "lucide-react";
import { TimePicker } from "./time-picker";

export function DateTimePicker({
  value,
  onChange,
}: {
  value?: Date;
  onChange: (date?: Date) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? (
            dayjs(value).format("YYYY-MM-DD HH:mm")
          ) : (
            <span>选择日期时间</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="flex gap-2 p-3">
          <Calendar
            // mode="single"
            selected={value}
            onSelect={onChange}
            // initialFocus
          />
          <TimePicker
            value={value}
            onChange={(hour, minute) => {
              const newDate = value ? new Date(value) : new Date();
              newDate.setHours(hour);
              newDate.setMinutes(minute);
              onChange(newDate);
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
