"use client";

import AuthRoute from "@/components/auth-route";
import { DateTimePicker } from "@/components/date-time-picker";
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
import { CREATE_RESERVATION } from "@/queries/book";
import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  guestName: z.string().min(2, "姓名至少2个字符"),
  email: z.string().email("请输入有效的邮箱地址"),
  phone: z.string().regex(/^1[3-9]\d{9}$/, "请输入有效的手机号"),
  arrivalTime: z.date({
    required_error: "请选择到店时间",
    invalid_type_error: "无效的时间格式",
  }),
  partySize: z.coerce.number().int().positive("人数必须为正整数"),
});

export default function BookPage() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guestName: "",
      email: "",
      phone: "",
      partySize: 2,
    },
  });

  const [createReservation, { loading }] = useMutation(CREATE_RESERVATION, {
    onCompleted: () => {
      router.push("/my-reservations");
    },
    onError: (error) => {
      form.setError("root", {
        message: error.message,
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createReservation({
      variables: {
        input: {
          ...values,
          arrivalTime: values.arrivalTime.toISOString(),
        },
      },
    });
  };

  return (
    <AuthRoute>
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">新建预约</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="guestName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>姓名</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>邮箱</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
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
                  <FormLabel>手机号</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="arrivalTime"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>到店时间</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="partySize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>用餐人数</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <div className="text-destructive text-sm">
                {form.formState.errors.root.message}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "提交中..." : "立即预约"}
            </Button>
          </form>
        </Form>
      </div>
    </AuthRoute>
  );
}
