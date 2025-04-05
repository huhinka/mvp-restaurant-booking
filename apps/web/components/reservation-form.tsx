"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CREATE_RESERVATION } from "@/queries/book";
import { UPDATE_RESERVATION } from "@/queries/reservation";
import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DateTimePicker } from "./date-time-picker";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const formSchema = z.object({
  guestName: z.string().min(2, "姓名至少2个字符"),
  email: z.string().email("请输入有效的邮箱地址"),
  phone: z.string().regex(/^1[3-9]\d{9}$/, "请输入有效的手机号"),
  arrivalTime: z.date({
    required_error: "请选择到店时间",
    invalid_type_error: "无效的时间格式",
  }),
  tableSize: z.coerce.number().int().positive("人数必须为正整数"),
});

export function ReservationForm({
  initialValues,
  mutationType = "create",
  reservationId,
  onSuccess,
}: {
  initialValues?: Partial<z.infer<typeof formSchema>>;
  mutationType?: "create" | "update";
  reservationId?: string;
  onSuccess?: () => void;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guestName: "",
      email: "",
      phone: "",
      tableSize: 2,
      ...initialValues,
    },
  });

  const [mutate, { loading, error }] = useMutation(
    mutationType === "create" ? CREATE_RESERVATION : UPDATE_RESERVATION,
    {
      onCompleted: () => {
        onSuccess?.();
        if (mutationType === "create") form.reset();
      },
    },
  );

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const variables =
      mutationType === "update"
        ? {
            id: reservationId,
            input: {
              ...values,
              arrivalTime: values.arrivalTime.toISOString(),
            },
          }
        : {
            input: {
              ...values,
              arrivalTime: values.arrivalTime.toISOString(),
            },
          };

    mutate({ variables });
  };

  return (
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
                <DateTimePicker value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tableSize"
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

        {error && (
          <div className="text-destructive text-sm">{error.message}</div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading
            ? "提交中..."
            : mutationType === "create"
              ? "立即预约"
              : "更新预约"}
        </Button>
      </form>
    </Form>
  );
}
