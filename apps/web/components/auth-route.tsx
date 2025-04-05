"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import { Loader2 } from "lucide-react";
import { GET_CURRENT_USER } from "@/queries/user";

export default function AuthRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, loading } = useQuery(GET_CURRENT_USER);

  useEffect(() => {
    if (!loading && !data?.me) {
      router.push("/login");
    }
  }, [data, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
