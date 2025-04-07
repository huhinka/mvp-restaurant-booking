import DataLoader from "dataloader";
import { ForbiddenError } from "../auth/auth.error.js";
import { User } from "../auth/user.model.js";
import { AppError } from "../infrastructure/error.js";
import { log } from "../infrastructure/logger.js";
import { Reservation, reservationStatuses } from "./reservation.model.js";

export const reservationResolvers = {
  Query: {
    myReservations: async (_, { page = 1, limit = 10 }, { user }) => {
      const query = { user: user._id };
      const options = {
        page,
        limit,
        sort: { _id: -1 },
      };
      const result = await Reservation.paginate(query, options);
      return paginationResult(result);
    },

    reservations: async (_, { page = 1, limit = 10, filter }, { user }) => {
      ensureStaff(user);

      const { startDate, endDate, statuses } = filter;
      const query = {};

      if (statuses?.length) {
        const invalidStatus = statuses.find(
          (s) => !reservationStatuses.includes(s)
        );
        if (invalidStatus) throw new AppError(`无效状态值: ${invalidStatus}`);
        query.status = { $in: statuses };
      }

      if (startDate || endDate) {
        query.arrivalTime = {};
        if (startDate) query.arrivalTime.$gte = new Date(startDate);
        if (endDate) query.arrivalTime.$lte = new Date(endDate);
      }

      const options = {
        page,
        limit,
        sort: { _id: -1 },
      };

      const result = await Reservation.paginate(query, options);
      return paginationResult(result);
    },

    me: async (_, __, { user }) => user,
  },

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
        throw new AppError(`无法创建预约: ${error.message}`);
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
          throw new AppError("找不到预约或预约状态不正确");
        }

        if (input.arrivalTime) {
          input.arrivalTime = new Date(input.arrivalTime);
        }

        Object.assign(reservation, input);
        return reservation.save();
      } catch (error) {
        log.error(`[Resolver] 更新预约失败: ${error.stack}`);
        throw new AppError(`无法更新预约: ${error.message}`);
      }
    },

    cancelReservation: async (_, { id, reason }, { user }) => {
      const reservation = await Reservation.findById(id);
      if (!user._id.equals(reservation?.user._id) && !user.isStaff()) {
        throw new AppError("找不到预约或您没有权限取消此预约");
      }

      reservation.status = "CANCELLED";
      reservation.cancellationReason = reason;

      log.info(`[Resolver] 取消预约成功: ${reservation._id}`);

      return reservation.save();
    },

    approveReservation: async (_, { id }, { user }) => {
      ensureStaff(user);

      return updateReservationStatus(id, "APPROVED");
    },

    completeReservation: async (_, { id }, { user }) => {
      ensureStaff(user);

      return updateReservationStatus(id, "COMPLETED");
    },
  },

  Reservation: {
    user: async (reservation, _, ctx) => {
      if (ctx.user._id.toString() === reservation.user.toString()) {
        return ctx.user;
      }

      return await userLoader.load(reservation.user);
    },
  },
};

/**
 * 转换 paginate 的结果为 graphql pagination 格式
 *
 * @param {object} result mongoose-paginate-v2 的结果
 * @returns 符合 graphql pagination 格式的结果
 */
function paginationResult(result) {
  return {
    items: result.docs,
    pageInfo: {
      totalItems: result.totalDocs,
      currentPage: result.page,
      itemsPerPage: result.limit,
      totalPages: result.totalPages,
      hasNextPage: result.nextPage || false,
    },
  };
}

/**
 * User 的 DataLoader。
 * 
 * Query reservations 时，如果同一个 user 出现多次，则只查询一次
 */
const userLoader = new DataLoader(async (userIds) => {
  const uniqueIds = [...new Set(userIds)];
  const users = await User.find({ _id: { $in: uniqueIds } });

  const userMap = new Map();
  users.forEach((user) => userMap.set(user._id.toString(), user));

  return userIds.map((id) => userMap.get(id.toString()));
});

function ensureStaff(user) {
  if (!user.isStaff()) {
    throw new ForbiddenError("权限不足，您没有权限进行此操作");
  }
}

/**
 * 更新某预约的状态。
 *
 * @param {ObjectId} id 预约 ID
 * @param {string} newStatus 新状态
 * @returns 更新后的预约
 */
async function updateReservationStatus(id, newStatus) {
  const reservation = await Reservation.findById(id);

  if (!statusTransitionMap[reservation.status].includes(newStatus)) {
    throw new AppError(`无法从 ${reservation.status} 变更为 ${newStatus}`);
  }

  log.info(`[Resolver] 更新预约状态: ${reservation._id} -> ${newStatus}`);

  reservation.status = newStatus;
  return reservation.save();
}

/**
 * 预约状态变更转移规则。
 */
const statusTransitionMap = {
  REQUESTED: ["APPROVED", "CANCELLED"],
  APPROVED: ["COMPLETED", "CANCELLED"],
  CANCELLED: [],
  COMPLETED: [],
};
