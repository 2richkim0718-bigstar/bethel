import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { sdk } from "./_core/sdk";
import { ENV } from "./_core/env";
import { hashPassword, verifyPassword } from "./_core/password";
import { getUserByUsername, createLocalUser } from "./db";
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
  updateUserProfile,
  getPastorsByDepartment,
  getRoomById,
  cancelRequest,
  markNotificationRead,
  markAllNotificationsRead,
} from "./db";
import { notifyOwner } from "./_core/notification";

/** 로그인/가입 성공 시 세션 쿠키(JWT)를 발급한다. 기존 세션 검증 파이프라인을 그대로 사용한다. */
async function establishSession(
  ctx: {
    req: CreateExpressContextOptions["req"];
    res: CreateExpressContextOptions["res"];
  },
  openId: string,
  name: string
) {
  const token = await sdk.signSession(
    { openId, appId: ENV.appId || "local", name },
    { expiresInMs: ONE_YEAR_MS }
  );
  const opts = getSessionCookieOptions(ctx.req);
  ctx.res.cookie(COOKIE_NAME, token, { ...opts, maxAge: ONE_YEAR_MS });
}

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

    /**
     * 사내 회원가입: 아이디/비밀번호 + 이름/역할/부서. 가입 즉시 로그인 처리된다.
     */
    register: publicProcedure
      .input(
        z.object({
          username: z
            .string()
            .trim()
            .min(2, "아이디는 2자 이상이어야 합니다.")
            .max(32)
            .regex(/^[a-zA-Z0-9_.-]+$/, "영문/숫자/._-만 사용할 수 있습니다."),
          password: z
            .string()
            .min(4, "비밀번호는 4자 이상이어야 합니다.")
            .max(128),
          name: z.string().trim().min(1).max(50),
          role: z.enum(["pastor", "member"]),
          department: z.string().min(1),
          age: z.number().int().positive().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const username = input.username.toLowerCase();
        const existing = await getUserByUsername(username);
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "이미 사용 중인 아이디입니다.",
          });
        }
        const user = await createLocalUser({
          username,
          passwordHash: hashPassword(input.password),
          name: input.name,
          role: input.role,
          department: input.department,
          age: input.age,
        });
        if (!user) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "가입에 실패했습니다.",
          });
        }
        await establishSession(ctx, user.openId, user.name || username);
        return user;
      }),

    /**
     * 사내 로그인: 아이디 + 비밀번호.
     */
    login: publicProcedure
      .input(
        z.object({
          username: z.string().trim().min(1),
          password: z.string().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const username = input.username.toLowerCase();
        const user = await getUserByUsername(username);
        if (
          !user ||
          !user.passwordHash ||
          !verifyPassword(input.password, user.passwordHash)
        ) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "아이디 또는 비밀번호가 올바르지 않습니다.",
          });
        }
        await establishSession(ctx, user.openId, user.name || username);
        return user;
      }),
    /**
     * 온보딩: 역할/나이/부서 입력 후 프로필 완료 처리.
     * 목사님 선택 시 admin 권한이 부여된다.
     */
    updateProfile: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).optional(),
          age: z.number().int().positive().optional(),
          department: z.string().min(1),
          role: z.enum(["pastor", "member"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await updateUserProfile(ctx.user.id, input);
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
     * 일정 충돌 사전 확인 (신청 폼에서 경고 표시용).
     */
    checkConflict: protectedProcedure
      .input(
        z.object({
          roomId: z.number(),
          requestDate: z.string(),
          startTime: z.string(),
          endTime: z.string(),
        })
      )
      .query(async ({ input }) => {
        const hasConflict = await checkScheduleConflict(
          input.roomId,
          input.requestDate,
          input.startTime,
          input.endTime
        );
        return { hasConflict };
      }),

    /**
     * 새로운 협조요청 생성.
     * 충돌이 있어도 생성은 허용하고(목사님 최종 판단), 담당 목사님에게 인앱 알림을 보낸다.
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
        if (input.endTime <= input.startTime) {
          throw new Error("종료 시간은 시작 시간보다 늦어야 합니다.");
        }

        // 요청 생성
        const created = await createRequest({
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

        // 담당 부서 결정: 장소는 장소 담당 부서, 물품은 신청자 소속 부서
        let department: string | null = null;
        let targetName = "";
        if (input.type === "space" && input.roomId) {
          const room = await getRoomById(input.roomId);
          department = room?.managerDepartment ?? null;
          targetName = room?.name ?? "장소";
        } else {
          department = ctx.user.department ?? null;
          targetName = "물품";
        }

        const requesterName = ctx.user.name || "사용자";
        const requestType = input.type === "space" ? "장소" : "물품";
        const message = `${requesterName}님이 ${targetName} ${requestType} 대여를 요청했습니다. (${input.requestDate} ${input.startTime}~${input.endTime})`;

        // 담당 목사님(들)에게 인앱 알림 생성
        if (department && created.id) {
          const pastors = await getPastorsByDepartment(department);
          await Promise.all(
            pastors.map(p =>
              createNotification({
                userId: p.id,
                requestId: created.id,
                message,
                type: "request_created",
              })
            )
          );
        }

        // 프로젝트 소유자에게도 알림(베스트에포트). 실패해도 신청은 성공 처리.
        try {
          await notifyOwner({
            title: `새로운 협조요청: ${requestType} 대여`,
            content: message,
          });
        } catch (err) {
          console.warn("[notifyOwner] skipped:", err);
        }

        return created;
      }),

    /**
     * 신청자가 본인의 대기 중 요청을 취소.
     */
    cancel: protectedProcedure
      .input(z.object({ requestId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await cancelRequest(input.requestId, ctx.user.id);
      }),

    /**
     * 목사님이 담당하는 협조요청 목록 조회 (본인 담당 부서 기준).
     */
    listByDepartment: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user.department) return [];
      return await getRequestsByManagerDepartment(ctx.user.department);
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
          const target = request.roomName || request.itemName || "협조요청";
          let message = "";
          if (input.status === "approved") {
            message = `[${target}] 대여 요청이 승인되었습니다.`;
          } else if (input.status === "partial") {
            message = `[${target}] 대여 요청이 일부 승인되었습니다. 가능 시간: ${input.approvedStartTime}~${input.approvedEndTime}`;
          } else if (input.status === "rejected") {
            message = `[${target}] 대여 요청이 반려되었습니다.`;
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

    /**
     * 단일 알림 읽음 처리
     */
    markRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await markNotificationRead(input.id, ctx.user.id);
      }),

    /**
     * 모든 알림 읽음 처리
     */
    markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
      return await markAllNotificationsRead(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
