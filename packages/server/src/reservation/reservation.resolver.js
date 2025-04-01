import { log } from "../infrastructure/logger.js";
import { Reservation } from "./reservation.model.js";

const statusTransitionMap = {
  REQUESTED: ["APPROVED", "CANCELLED"],
  APPROVED: ["COMPLETED", "CANCELLED"],
  CANCELLED: [],
  COMPLETED: [],
};

export const reservationResolvers = {
  Mutation: {
    createReservation: async (_, { input }, { user }) => {
      try {
        const reservationData = {
          ...input,
          arrivalTime: new Date(input.arrivalTime),
          user: user._id,
        };
        const newReservation = await Reservation.create(reservationData);

        log.info(`[Resolver] 新预约创建成功: ${newReservation._id}`);
        return newReservation;
      } catch (error) {
        log.error(`[Resolver] 创建预约失败: ${error.stack}`);
        throw new Error(`无法创建预约: ${error.message}`);
      }
    },

    updateReservation: async (_, { id, input }, { user }) => {
      try {
        const reservation = await Reservation.findOne({
          _id: id,
          user: user._id,
          status: "REQUESTED",
        });
        if (!reservation) {
          throw new Error("找不到预约或预约状态不正确");
        }

        if (input.arrivalTime) {
          input.arrivalTime = new Date(input.arrivalTime);
        }

        Object.assign(reservation, input);
        return reservation.save();
      } catch (error) {
        log.error(`[Resolver] 更新预约失败: ${error.stack}`);
        throw new Error(`无法更新预约: ${error.message}`);
      }
    },

    cancelReservation: async (_, { id }, { user }) => {
      const reservation = await Reservation.findById(id);
      if (!user._id.equals(reservation?.user._id) && !user.isStaff()) {
        throw new Error("找不到预约或您没有权限取消此预约");
      }

      reservation.status = "CANCELLED";
      return reservation.save();
    },

    approveReservation: async (_, { id }, { user }) => {
      ensureStaff(user);

      return updateReservationStatus(id, "APPROVED");
    },
  },
};

function ensureStaff(user) {
  if (!user.isStaff()) {
    throw new Error("权限不足，您没有权限进行此操作");
  }
}

async function updateReservationStatus(id, newStatus) {
  const reservation = await Reservation.findById(id);

  if (!statusTransitionMap[reservation.status].includes(newStatus)) {
    throw new Error(`无法从 ${reservation.status} 变更为 ${newStatus}`);
  }

  reservation.status = newStatus;
  return reservation.save();
}
