export const statusVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  REQUESTED: "secondary",
  APPROVED: "default",
  CANCELLED: "destructive",
  COMPLETED: "outline",
};
