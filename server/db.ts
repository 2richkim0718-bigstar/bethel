import { eq, desc, sql, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  rooms,
  items,
  requests,
  notifications,
  InsertRequest,
  InsertNotification,
  Request,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

/** 신청자/장소/물품 이름을 합친, 화면에서 바로 쓰는 요청 형태. */
export type EnrichedRequest = Request & {
  roomName: string | null;
  itemName: string | null;
  requesterName: string | null;
  requesterDepartment: string | null;
};

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * 사내 로그인 아이디로 사용자 조회.
 */
export async function getUserByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * 사내 로그인 계정 생성. openId는 `local:<username>` 형태로 저장한다.
 * 가입 시 역할/부서를 함께 받아 프로필을 바로 완료 처리한다.
 */
export async function createLocalUser(data: {
  username: string;
  passwordHash: string;
  name: string;
  role: "pastor" | "member";
  department: string;
  age?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const openId = `local:${data.username}`;
  await db.insert(users).values({
    openId,
    username: data.username,
    passwordHash: data.passwordHash,
    name: data.name,
    role: data.role === "pastor" ? "admin" : "user",
    department: data.department,
    age: data.age,
    profileCompleted: 1,
    loginMethod: "local",
    lastSignedIn: new Date(),
  });

  return getUserByUsername(data.username);
}

/**
 * 온보딩(프로필 입력) 완료 처리.
 * 역할에 따라 권한을 부여한다: 목사님 → admin, 성도 → user.
 */
export async function updateUserProfile(
  userId: number,
  data: {
    name?: string;
    age?: number;
    department: string;
    role: "pastor" | "member";
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(users)
    .set({
      ...(data.name ? { name: data.name } : {}),
      age: data.age,
      department: data.department,
      role: data.role === "pastor" ? "admin" : "user",
      profileCompleted: 1,
    })
    .where(eq(users.id, userId));

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * 특정 부서를 담당하는 목사님(admin) 목록.
 * 신청 시 인앱 알림을 보낼 대상이다.
 */
export async function getPastorsByDepartment(department: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(users)
    .where(and(eq(users.role, "admin"), eq(users.department, department)));
}

/** 요청 목록에 신청자/장소/물품 이름을 합쳐 화면용 형태로 변환. */
async function enrichRequests(
  db: NonNullable<Awaited<ReturnType<typeof getDb>>>,
  rows: Request[]
): Promise<EnrichedRequest[]> {
  if (rows.length === 0) return [];

  const [roomList, itemList, userList] = await Promise.all([
    db.select().from(rooms),
    db.select().from(items),
    db.select().from(users),
  ]);
  const roomMap = new Map(roomList.map(r => [r.id, r]));
  const itemMap = new Map(itemList.map(i => [i.id, i]));
  const userMap = new Map(userList.map(u => [u.id, u]));

  return rows.map(r => ({
    ...r,
    roomName: r.roomId != null ? (roomMap.get(r.roomId)?.name ?? null) : null,
    itemName: r.itemId != null ? (itemMap.get(r.itemId)?.name ?? null) : null,
    requesterName: userMap.get(r.requesterId)?.name ?? null,
    requesterDepartment: userMap.get(r.requesterId)?.department ?? null,
  }));
}

/**
 * 장소 목록 조회
 */
export async function getRooms() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(rooms);
}

/**
 * 물품 목록 조회
 */
export async function getItems() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(items);
}

/**
 * 사용자의 협조요청 목록 조회 (최신순, 신청자/장소/물품 이름 포함)
 */
export async function getUserRequests(
  userId: number
): Promise<EnrichedRequest[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select()
    .from(requests)
    .where(eq(requests.requesterId, userId))
    .orderBy(desc(requests.createdAt));
  return enrichRequests(db, rows);
}

/**
 * 특정 협조요청 상세 조회 (신청자/장소/물품 이름 포함)
 */
export async function getRequestById(
  requestId: number
): Promise<EnrichedRequest | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(requests)
    .where(eq(requests.id, requestId))
    .limit(1);
  if (result.length === 0) return undefined;
  const [enriched] = await enrichRequests(db, result);
  return enriched;
}

/**
 * 목사님이 담당하는 협조요청 목록 조회.
 * - 담당 부서의 장소(rooms.managerDepartment)에 대한 장소 요청
 * - Phase 1: 같은 부서 성도가 올린 물품 요청도 함께 전달
 */
export async function getRequestsByManagerDepartment(
  department: string
): Promise<EnrichedRequest[]> {
  const db = await getDb();
  if (!db) return [];

  const roomsInDept = await db
    .select()
    .from(rooms)
    .where(eq(rooms.managerDepartment, department));
  const roomIds = roomsInDept.map(r => r.id);

  const usersInDept = await db
    .select()
    .from(users)
    .where(eq(users.department, department));
  const memberIds = usersInDept.map(u => u.id);

  const conditions: ReturnType<typeof sql>[] = [];
  if (roomIds.length > 0) {
    conditions.push(
      sql`(${requests.type} = 'space' AND ${requests.roomId} IN (${sql.join(roomIds, sql`, `)}))`
    );
  }
  if (memberIds.length > 0) {
    conditions.push(
      sql`(${requests.type} = 'item' AND ${requests.requesterId} IN (${sql.join(memberIds, sql`, `)}))`
    );
  }
  if (conditions.length === 0) return [];

  const rows = await db
    .select()
    .from(requests)
    .where(sql.join(conditions, sql` OR `))
    .orderBy(desc(requests.createdAt));
  return enrichRequests(db, rows);
}

/**
 * 신청자가 본인의 pending 요청을 취소.
 */
export async function cancelRequest(requestId: number, requesterId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(requests)
    .where(eq(requests.id, requestId))
    .limit(1);
  const request = result[0];
  if (!request) throw new Error("요청을 찾을 수 없습니다.");
  if (request.requesterId !== requesterId)
    throw new Error("본인의 요청만 취소할 수 있습니다.");
  if (request.status !== "pending")
    throw new Error("대기 중인 요청만 취소할 수 있습니다.");

  await db.delete(notifications).where(eq(notifications.requestId, requestId));
  await db.delete(requests).where(eq(requests.id, requestId));
  return { success: true };
}

/**
 * 단일 장소 조회
 */
export async function getRoomById(roomId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(rooms)
    .where(eq(rooms.id, roomId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * 협조요청 생성. 생성된 요청의 id를 반환한다.
 */
export async function createRequest(
  data: InsertRequest
): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(requests).values(data);
  const insertId =
    (result as unknown as { insertId?: number }[])[0]?.insertId ??
    (result as unknown as { insertId?: number }).insertId ??
    0;
  return { id: Number(insertId) };
}

/**
 * 협조요청 상태 업데이트
 */
export async function updateRequestStatus(
  requestId: number,
  status: "approved" | "partial" | "rejected",
  approvedStartTime?: string,
  approvedEndTime?: string,
  memo?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = { status, memo };
  if (approvedStartTime) updateData.approvedStartTime = approvedStartTime;
  if (approvedEndTime) updateData.approvedEndTime = approvedEndTime;

  return db.update(requests).set(updateData).where(eq(requests.id, requestId));
}

/**
 * 사용자 알림 목록 조회
 */
export async function getUserNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));
}

/**
 * 알림 생성
 */
export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(notifications).values(data);
}

/**
 * 단일 알림 읽음 처리 (본인 알림만)
 */
export async function markNotificationRead(
  notificationId: number,
  userId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(notifications)
    .set({ isRead: 1 })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      )
    );
  return { success: true };
}

/**
 * 사용자의 모든 알림 읽음 처리
 */
export async function markAllNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(notifications)
    .set({ isRead: 1 })
    .where(eq(notifications.userId, userId));
  return { success: true };
}

/**
 * 일정 충돌 확인 (동일 장소, 동일 시간대에 승인된 요청이 있는지 확인)
 */
export async function checkScheduleConflict(
  roomId: number,
  requestDate: string,
  startTime: string,
  endTime: string,
  excludeRequestId?: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const conflictingRequests = await db
    .select()
    .from(requests)
    .where(
      sql`${requests.roomId} = ${roomId}
        AND ${requests.requestDate} = ${requestDate}
        AND ${requests.status} IN ('approved', 'partial')
        AND NOT (${requests.endTime} <= ${startTime} OR ${requests.startTime} >= ${endTime})
        ${excludeRequestId ? sql`AND ${requests.id} != ${excludeRequestId}` : sql``}`
    );

  return conflictingRequests.length > 0;
}

/**
 * 초기 시드 데이터 (장소/물품). 서버 부팅 시 멱등하게 1회 실행한다.
 * 이미 데이터가 있으면 건너뛴다.
 */
export async function seedInitialData() {
  const db = await getDb();
  if (!db) return;

  const existingRooms = await db.select().from(rooms).limit(1);
  if (existingRooms.length === 0) {
    await db.insert(rooms).values([
      {
        name: "뮤직홀",
        managerDepartment: "2청년부",
        description: "음향 시설을 갖춘 다목적 홀",
        capacity: 120,
      },
      {
        name: "오픈홀",
        managerDepartment: "1청년부",
        description: "자유롭게 모임을 가질 수 있는 열린 공간",
        capacity: 80,
      },
      {
        name: "교육관 701호",
        managerDepartment: "고등2부",
        description: "교육 및 소그룹 모임용 강의실",
        capacity: 40,
      },
      {
        name: "교육관 702호",
        managerDepartment: "중등2부",
        description: "교육 및 소그룹 모임용 강의실",
        capacity: 40,
      },
    ]);
    console.log("[Seed] 기본 장소 데이터를 생성했습니다.");
  }

  const existingItems = await db.select().from(items).limit(1);
  if (existingItems.length === 0) {
    await db.insert(items).values([
      {
        name: "빔 프로젝터",
        category: "영상",
        quantity: 3,
        description: "휴대용 프로젝터",
      },
      {
        name: "무선 마이크",
        category: "음향",
        quantity: 6,
        description: "핸드/핀 마이크 세트",
      },
      {
        name: "이동식 앰프",
        category: "음향",
        quantity: 2,
        description: "야외/소규모 모임용 앰프",
      },
      {
        name: "접이식 테이블",
        category: "비품",
        quantity: 20,
        description: "행사용 접이식 테이블",
      },
      {
        name: "접이식 의자",
        category: "비품",
        quantity: 100,
        description: "행사용 의자",
      },
      {
        name: "전기 주전자",
        category: "비품",
        quantity: 4,
        description: "간식/모임용",
      },
    ]);
    console.log("[Seed] 기본 물품 데이터를 생성했습니다.");
  }
}
