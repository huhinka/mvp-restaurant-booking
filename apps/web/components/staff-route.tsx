"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_CURRENT_USER } from "@/queries/user";
import { Loader2 } from "lucide-react";

export default function StaffRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data, loading } = useQuery(GET_CURRENT_USER);

  useEffect(() => {
    if (!loading && data?.me?.role !== "staff") {
      router.replace("/my-reservations");
    }
  }, [data, loading, router]);

  if (loading || data?.me?.role !== "staff") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
