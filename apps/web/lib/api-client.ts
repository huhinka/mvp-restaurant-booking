import axios from "axios";
import { AxiosError } from "axios";
import { FieldValues, UseFormSetError } from "react-hook-form";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type ServerError = {
  message?: string;
  errors?: Record<string, string[]>;
};

export const handleApiError = <T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  setGlobalError?: (message: string) => void,
) => {
  const axiosError = error as AxiosError<ServerError>;

  if (!axiosError.response) {
    setGlobalError?.("网络异常，请检查您的网络");
    return;
  }

  const { status, data } = axiosError.response;

  // 处理字段级别错误
  if (data.errors) {
    Object.entries(data.errors).forEach(([field, messages]) => {
      setError(field as any, {
        type: "manual",
        message: messages.join(", "),
      });
    });
  }

  // 处理全局错误
  const globalMessage =
    data.message ||
    (status === 500 ? "服务器内部错误，请稍后再试" : "请求失败，请稍后再试");
  setGlobalError?.(globalMessage);
};
