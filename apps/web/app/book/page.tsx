"use client";

import AuthRoute from "@/components/auth-route";
import { ReservationForm } from "@/components/reservation-form";
import { useRouter } from "next/navigation";

export default function BookPage() {
  const router = useRouter();
  return (
    <AuthRoute>
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">新建预约</h1>
        <ReservationForm
          mutationType="create"
          onSuccess={() => {
            router.push("/my-reservations");
          }}
        />
      </div>
    </AuthRoute>
  );
}
