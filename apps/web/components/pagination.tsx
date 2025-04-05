"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaginationProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number, pageSize: number) => void;
}

export function Pagination({
  current,
  total,
  pageSize,
  onChange,
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="flex items-center space-x-4">
        <div className="text-sm text-muted-foreground">共 {total} 条记录</div>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => onChange(1, Number(value))}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 20, 30, 40, 50].map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          disabled={current <= 1}
          onClick={() => onChange(current - 1, pageSize)}
        >
          上一页
        </Button>
        <div className="text-sm font-medium">
          第 {current} 页 / 共 {totalPages} 页
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={current >= totalPages}
          onClick={() => onChange(current + 1, pageSize)}
        >
          下一页
        </Button>
      </div>
    </div>
  );
}
