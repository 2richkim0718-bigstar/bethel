import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** 내부 식별자. 사내 로그인은 `local:<username>` 형태로 저장된다. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  /** 사내 로그인 아이디. 사용자가 직접 정한다. Unique. */
  username: varchar("username", { length: 64 }).unique(),
  /** scrypt 비밀번호 해시 (salt:hash). 사내 로그인 전용. */
  passwordHash: varchar("passwordHash", { length: 255 }),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  /** 나이 (온보딩 시 입력). */
  age: int("age"),
  /** 소속 부서 (성도) 또는 담당 부서 (목사님). 장소 라우팅의 기준. */
  department: varchar("department", { length: 255 }),
  /** 온보딩(프로필 입력) 완료 여부. 0: 미완료, 1: 완료. */
  profileCompleted: int("profileCompleted").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Room (장소) 테이블
 */
export const rooms = mysqlTable("rooms", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // 뮤직홀, 오픈홀 등
  description: text("description"), // 장소 설명
  managerDepartment: varchar("managerDepartment", { length: 255 }).notNull(), // 담당 부서 (2청년부, 1청년부 등)
  capacity: int("capacity"), // 수용 인원
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Room = typeof rooms.$inferSelect;
export type InsertRoom = typeof rooms.$inferInsert;

/**
 * Item (물품) 테이블
 */
export const items = mysqlTable("items", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // 물품명
  description: text("description"), // 물품 설명
  category: varchar("category", { length: 100 }), // 카테고리
  quantity: int("quantity").default(1), // 보유 수량
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Item = typeof items.$inferSelect;
export type InsertItem = typeof items.$inferInsert;

/**
 * Request (협조요청) 테이블
 */
export const requests = mysqlTable("requests", {
  id: int("id").autoincrement().primaryKey(),
  requesterId: int("requesterId").notNull(), // FK: User
  type: mysqlEnum("type", ["space", "item"]).notNull(), // 장소 대여 or 물품 대여
  roomId: int("roomId"), // FK: Room (nullable for item)
  itemId: int("itemId"), // FK: Item (nullable for space)
  itemQuantity: int("itemQuantity"), // 물품 수량
  requestDate: varchar("requestDate", { length: 10 }).notNull(), // YYYY-MM-DD
  startTime: varchar("startTime", { length: 5 }).notNull(), // HH:MM
  endTime: varchar("endTime", { length: 5 }).notNull(), // HH:MM
  purpose: text("purpose"), // 사용 목적
  attendeeCount: int("attendeeCount"), // 참석 인원
  status: mysqlEnum("status", ["pending", "approved", "partial", "rejected"])
    .default("pending")
    .notNull(),
  approvedStartTime: varchar("approvedStartTime", { length: 5 }), // 부분승인 시 가능한 시작 시간
  approvedEndTime: varchar("approvedEndTime", { length: 5 }), // 부분승인 시 가능한 종료 시간
  memo: text("memo"), // 승인/거절 사유 또는 메모
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Request = typeof requests.$inferSelect;
export type InsertRequest = typeof requests.$inferInsert;

/**
 * Notification (알림) 테이블
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // FK: User
  requestId: int("requestId").notNull(), // FK: Request
  message: text("message").notNull(), // 알림 메시지
  type: mysqlEnum("type", [
    "request_created",
    "approved",
    "partial",
    "rejected",
  ]).notNull(),
  isRead: int("isRead").default(0), // 0: 미읽음, 1: 읽음
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
