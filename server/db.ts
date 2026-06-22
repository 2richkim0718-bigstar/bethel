import { eq, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, rooms, items, requests, notifications, InsertRequest, InsertNotification } from "../drizzle/schema";
import { ENV } from './_core/env';

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
      values.role = 'admin';
      updateSet.role = 'admin';
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

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
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
 * 사용자의 협조요청 목록 조회
 */
export async function getUserRequests(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(requests).where(eq(requests.requesterId, userId));
}

/**
 * 특정 협조요청 상세 조회
 */
export async function getRequestById(requestId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(requests).where(eq(requests.id, requestId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * 목사님이 담당하는 협조요청 목록 조회
 */
export async function getRequestsByManagerDepartment(department: string) {
  const db = await getDb();
  if (!db) return [];
  
  const roomsInDept = await db.select().from(rooms).where(eq(rooms.managerDepartment, department));
  const roomIds = roomsInDept.map(r => r.id);
  
  if (roomIds.length === 0) return [];
  
  return db.select().from(requests).where(
    sql`${requests.roomId} IN (${sql.join(roomIds)})`
  );
}

/**
 * 협조요청 생성
 */
export async function createRequest(data: InsertRequest) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(requests).values(data);
  return result;
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
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
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
