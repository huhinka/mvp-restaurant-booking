"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { apiClient, handleApiError } from "@/lib/api-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginSchema = z.object({
  identifier: z
    .union([
      z.string().email(),
      z.string().regex(/^1[3-9]\d{9}$/, "请输入有效的手机号码"),
    ])
    .catch("请输入有效的电子邮箱或手机号码"),
  password: z.string().min(8, "密码长度不能少于8位"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [globalError, setGlobalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<LoginForm>({
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginForm) => {
    try {
      const res = await apiClient.post("/auth/login", values);
      localStorage.setItem("token", res.data.token);
      router.push("/my-reservations");
    } catch (error) {
      handleApiError(error, form.setError, (message) =>
        setGlobalError(message)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-bold mb-6">登录</h1>

      {globalError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {globalError}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>电子邮件/手机号码</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>密码</FormLabel>
                <FormControl>
                  <Input {...field} type="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "登录中..." : "登录"}
          </Button>
        </form>
      </Form>

      <p className="mt-4 text-center text-sm">
        没有账号？{" "}
        <Link href="/register" className="text-blue-600 hover:underline">
          注册
        </Link>
      </p>
    </div>
  );
}
