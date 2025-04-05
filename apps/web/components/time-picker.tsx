"use client";

import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TimePicker({
  value,
  onChange,
}: {
  value?: Date;
  onChange: (hour: number, minute: number) => void;
}) {
  const currentDate = value || new Date();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm">
        <Clock className="h-4 w-4" />
        {currentDate.toLocaleTimeString("zh-CN", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
      <div className="grid grid-cols-4 gap-1">
        {Array.from({ length: 24 }).map((_, hour) => (
          <DropdownMenu key={hour}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                {hour.toString().padStart(2, "0")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-16">
              {[0, 15, 30, 45].map((minute) => (
                <Button
                  key={minute}
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => onChange(hour, minute)}
                >
                  {minute.toString().padStart(2, "0")}
                </Button>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </div>
    </div>
  );
}
