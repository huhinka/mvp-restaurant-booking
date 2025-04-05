"use client";

import { ReservationForm } from "@/components/reservation-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

interface EditDialogProps {
  reservation: {
    id: string;
    guestName: string;
    email: string;
    phone: string;
    arrivalTime: string;
    tableSize: number;
  };
}

export function EditReservationDialog({ reservation }: EditDialogProps) {
  const [open, setOpen] = useState(false);

  const initialValues = {
    guestName: reservation.guestName,
    email: reservation.email,
    phone: reservation.phone,
    arrivalTime: new Date(reservation.arrivalTime),
    tableSize: reservation.tableSize,
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          编辑
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>编辑预约</DialogTitle>
        </DialogHeader>
        <ReservationForm
          initialValues={initialValues}
          mutationType="update"
          reservationId={reservation.id}
          onSuccess={() => {
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
