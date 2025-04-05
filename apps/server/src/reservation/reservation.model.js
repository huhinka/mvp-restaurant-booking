import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export const reservationStatuses = [
  "REQUESTED",
  "APPROVED",
  "CANCELLED",
  "COMPLETED",
];

const reservationSchema = new mongoose.Schema(
  {
    guestName: {
      type: String,
      required: [true, "客人姓名必填"],
    },
    email: {
      type: String,
      required: [true, "邮箱必填"],
      match: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
    },
    phone: {
      type: String,
      required: [true, "联系电话必填"],
      match: /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
    },
    arrivalTime: {
      type: Date,
      required: [true, "到店时间必填"],
    },
    tableSize: {
      type: Number,
      required: [true, "用餐人数必填"],
      min: [1, "用餐人数至少1人"],
    },
    status: {
      type: String,
      enum: {
        values: reservationStatuses,
        message: "无效的状态值",
      },
      default: "REQUESTED",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

reservationSchema.plugin(mongoosePaginate);

export const Reservation = mongoose.model("Reservation", reservationSchema);
