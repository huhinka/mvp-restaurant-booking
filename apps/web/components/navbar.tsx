"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GET_CURRENT_USER } from "@/queries/user";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data, loading } = useQuery(GET_CURRENT_USER);
  const user = data?.me;

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* 左侧导航链接 */}
          <div className="flex space-x-8">
            <Link
              href="/my-reservations"
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                pathname.startsWith("/my-reservations")
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              我的预约
            </Link>
            {user?.role === "staff" && (
              <Link
                href="/reservations"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  pathname.startsWith("/staff")
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                预约管理
              </Link>
            )}
          </div>

          {/* 右侧用户信息/登录注册 */}
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="flex items-center space-x-4">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-9 w-[80px]" />
                <Skeleton className="h-9 w-[80px]" />
              </div>
            ) : user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{user.email}</span>
                <form onSubmit={handleLogout}>
                  <Button variant="outline" size="sm" type="submit">
                    退出登录
                  </Button>
                </form>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    登录
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">注册</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
