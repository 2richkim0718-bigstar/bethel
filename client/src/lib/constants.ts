// 부서 목록 — 추후 확장 가능. 장소(rooms.managerDepartment)와 값이 일치해야 라우팅된다.
export const DEPARTMENTS = [
  "유치부",
  "중등2부",
  "고등2부",
  "1청년부",
  "2청년부",
  "3청년부",
] as const;

export type Department = (typeof DEPARTMENTS)[number];

// 요청 상태 표시용 메타데이터
export const STATUS_META: Record<
  string,
  { label: string; badgeClass: string }
> = {
  pending: { label: "대기 중", badgeClass: "badge-pending" },
  approved: { label: "승인됨", badgeClass: "badge-approved" },
  partial: { label: "일부 승인", badgeClass: "badge-partial" },
  rejected: { label: "거절됨", badgeClass: "badge-rejected" },
};
