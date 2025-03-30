import { Reservation } from "./reservation.model.js";
import { log } from "../infrastructure/logger.js";

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

    approveReservation: async (_, { id }, { user }) => {
      ensureStaff(user);

      return updateReservationStatus(id, "APPROVED");
    },
  },
};

function ensureStaff(user) {
  if (!user.role || user.role !== "staff") {
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
