"use client";

import { useForm } from "react-hook-form";
import { apiClient, handleApiError } from "@/lib/api-client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

const registerSchema = z
  .object({
    email: z.string().email("请输入有效的电子邮箱"),
    phone: z.string().regex(/^1[3-9]\d{9}$/, "请输入有效的手机号码"),
    password: z.string().min(8, "密码长度不能小于8位"),
    confirmPassword: z.string().min(8, "密码长度不能小于8位"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [globalError, setGlobalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterForm) => {
    setGlobalError("");
    setIsSubmitting(true);

    try {
      const { confirmPassword, ...submitValues } = values;

      const res = await apiClient.post("/auth/register", submitValues);
      localStorage.setItem("token", res.data.token);
      window.location.href = "/";
    } catch (error) {
      handleApiError(error, form.setError, (message) =>
        setGlobalError(message),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-bold mb-6">注册</h1>

      {globalError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {globalError}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>电子邮箱</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>手机号码</FormLabel>
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

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>确认密码</FormLabel>
                <FormControl>
                  <Input {...field} type="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "注册中..." : "注册"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm">
          已经有账号了？{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            登录
          </Link>
        </p>
      </Form>
    </div>
  );
}
