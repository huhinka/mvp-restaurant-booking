"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@apollo/client";
import { CANCEL_RESERVATION } from "@/queries/reservation";

interface CancelDialogProps {
  reservationId: string;
  currentStatus: string;
  onSuccess: () => void;
}

export function CancelReservationDialog({
  reservationId,
  currentStatus,
  onSuccess,
}: CancelDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const { toast } = useToast();

  const [cancelReservation, { loading }] = useMutation(CANCEL_RESERVATION, {
    onCompleted: () => {
      toast({
        title: "取消成功",
        description: "预约已取消",
      });
      setOpen(false);
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "取消失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const canCancel = ["REQUESTED", "APPROVED"].includes(currentStatus);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={!canCancel}>
          取消预约
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认取消预约？</DialogTitle>
          <DialogDescription>
            此操作不可撤销。请填写取消原因（可选）：
          </DialogDescription>
        </DialogHeader>

        <Textarea
          placeholder="请输入取消原因..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            返回
          </Button>
          <Button
            variant="destructive"
            disabled={loading}
            onClick={() =>
              cancelReservation({
                variables: {
                  id: reservationId,
                  reason: reason.trim() || "用户主动取消",
                },
              })
            }
          >
            {loading ? "取消中..." : "确认取消"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
