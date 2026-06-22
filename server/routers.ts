import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getRooms,
  getItems,
  getUserRequests,
  getRequestById,
  getRequestsByManagerDepartment,
  createRequest,
  updateRequestStatus,
  getUserNotifications,
  createNotification,
  checkScheduleConflict,
} from "./db";
import { notifyOwner } from "./_core/notification";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ChurchLink 기능 라우터
  rooms: router({
    /**
     * 모든 장소 목록 조회
     */
    list: publicProcedure.query(async () => {
      return await getRooms();
    }),
  }),

  items: router({
    /**
     * 모든 물품 목록 조회
     */
    list: publicProcedure.query(async () => {
      return await getItems();
    }),
  }),

  requests: router({
    /**
     * 사용자의 협조요청 목록 조회
     */
    listMy: protectedProcedure.query(async ({ ctx }) => {
      return await getUserRequests(ctx.user.id);
    }),

    /**
     * 특정 협조요청 상세 조회
     */
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getRequestById(input.id);
      }),

    /**
     * 새로운 협조요청 생성
     */
    create: protectedProcedure
      .input(
        z.object({
          type: z.enum(["space", "item"]),
          roomId: z.number().optional(),
          itemId: z.number().optional(),
          itemQuantity: z.number().optional(),
          requestDate: z.string(), // YYYY-MM-DD
          startTime: z.string(), // HH:MM
          endTime: z.string(), // HH:MM
          purpose: z.string().optional(),
          attendeeCount: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // 일정 충돌 확인
        if (input.type === "space" && input.roomId) {
          const hasConflict = await checkScheduleConflict(
            input.roomId,
            input.requestDate,
            input.startTime,
            input.endTime
          );
          if (hasConflict) {
            throw new Error("해당 시간대에 이미 승인된 요청이 있습니다.");
          }
        }

        // 요청 생성
        const result = await createRequest({
          requesterId: ctx.user.id,
          type: input.type,
          roomId: input.roomId,
          itemId: input.itemId,
          itemQuantity: input.itemQuantity,
          requestDate: input.requestDate,
          startTime: input.startTime,
          endTime: input.endTime,
          purpose: input.purpose,
          attendeeCount: input.attendeeCount,
          status: "pending",
        });

        // 담당 목사님에게 알림 발송
        const requesterName = ctx.user.name || "사용자";
        const requestType = input.type === "space" ? "장소" : "물품";
        await notifyOwner({
          title: `새로운 협조요청: ${requestType} 대여`,
          content: `${requesterName}님이 ${requestType} 대여를 요청했습니다. (날짜: ${input.requestDate}, 시간: ${input.startTime}~${input.endTime})`,
        });

        return result;
      }),

    /**
     * 목사님이 담당하는 협조요청 목록 조회
     */
    listByDepartment: protectedProcedure
      .input(z.object({ department: z.string() }))
      .query(async ({ input }) => {
        return await getRequestsByManagerDepartment(input.department);
      }),

    /**
     * 협조요청 승인/부분승인/거절 처리
     */
    updateStatus: protectedProcedure
      .input(
        z.object({
          requestId: z.number(),
          status: z.enum(["approved", "partial", "rejected"]),
          approvedStartTime: z.string().optional(),
          approvedEndTime: z.string().optional(),
          memo: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        // 요청 상태 업데이트
        await updateRequestStatus(
          input.requestId,
          input.status,
          input.approvedStartTime,
          input.approvedEndTime,
          input.memo
        );

        // 신청자에게 알림 발송
        const request = await getRequestById(input.requestId);
        if (request) {
          let message = "";
          if (input.status === "approved") {
            message = "협조요청이 승인되었습니다.";
          } else if (input.status === "partial") {
            message = `협조요청이 일부 승인되었습니다. 가능 시간: ${input.approvedStartTime}~${input.approvedEndTime}`;
          } else if (input.status === "rejected") {
            message = "협조요청이 반려되었습니다.";
          }

          await createNotification({
            userId: request.requesterId,
            requestId: input.requestId,
            message,
            type:
              input.status === "approved"
                ? "approved"
                : input.status === "partial"
                  ? "partial"
                  : "rejected",
          });
        }

        return { success: true };
      }),
  }),

  notifications: router({
    /**
     * 사용자의 알림 목록 조회
     */
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserNotifications(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
