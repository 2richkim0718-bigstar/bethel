import { useRoute, useLocation } from "wouter";
import { useState } from "react";
import AppNav from "@/components/AppNav";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MapPin,
  Package,
  Trash2,
} from "lucide-react";
import { STATUS_META } from "@/lib/constants";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function StatusIcon({ status }: { status: string }) {
  const cls = "h-6 w-6";
  switch (status) {
    case "pending":
      return <Clock className={`${cls} text-warning`} />;
    case "approved":
      return <CheckCircle2 className={`${cls} text-success`} />;
    case "partial":
      return <AlertCircle className={`${cls} text-info`} />;
    case "rejected":
      return <XCircle className={`${cls} text-destructive`} />;
    default:
      return null;
  }
}

export default function RequestDetail() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/request/:id");
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [confirmCancel, setConfirmCancel] = useState(false);

  const requestId = params?.id ? parseInt(params.id) : null;
  const { data: request, isLoading } = trpc.requests.getById.useQuery(
    { id: requestId! },
    { enabled: !!requestId }
  );

  const cancelMutation = trpc.requests.cancel.useMutation({
    onSuccess: () => {
      toast.success("요청이 취소되었습니다.");
      utils.requests.listMy.invalidate();
      setLocation("/dashboard");
    },
    onError: e => toast.error(e.message || "취소에 실패했습니다."),
  });

  if (!match) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppNav />
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-background">
        <AppNav />
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">요청을 찾을 수 없습니다.</p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => setLocation("/dashboard")}
          >
            돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const meta = STATUS_META[request.status];
  const title =
    request.type === "space"
      ? (request.roomName ?? "장소 대여")
      : (request.itemName ?? "물품 대여");
  const isOwner = user?.id === request.requesterId;
  const canCancel = isOwner && request.status === "pending";

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <div className="container max-w-2xl py-8">
        <button
          onClick={() => setLocation("/dashboard")}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> 돌아가기
        </button>

        {/* 상태 헤더 */}
        <div className="card-elegant mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <StatusIcon status={request.status} />
            <div>
              <div className="flex items-center gap-2">
                {request.type === "space" ? (
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Package className="h-4 w-4 text-muted-foreground" />
                )}
                <h1 className="font-serif text-xl font-bold text-foreground">
                  {title}
                </h1>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {request.type === "space" ? "장소 대여" : "물품 대여"} 요청
              </p>
            </div>
          </div>
          <span className={meta?.badgeClass}>{meta?.label}</span>
        </div>

        {/* 상세 */}
        <div className="card-elegant space-y-6">
          <div>
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              기본 정보
            </h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Field label="신청자" value={request.requesterName ?? "-"} />
              <Field label="요청 날짜" value={request.requestDate} />
              <Field
                label="요청 시간"
                value={`${request.startTime} ~ ${request.endTime}`}
              />
              {request.type === "item" && request.itemQuantity != null && (
                <Field label="수량" value={`${request.itemQuantity}`} />
              )}
              {request.attendeeCount != null && (
                <Field label="참석 인원" value={`${request.attendeeCount}명`} />
              )}
              {request.purpose && (
                <Field label="사용 목적" value={request.purpose} full />
              )}
            </dl>
          </div>

          {request.status !== "pending" && (
            <div className="border-t border-border pt-5">
              <h2 className="mb-3 text-sm font-semibold text-foreground">
                처리 결과
              </h2>
              <dl className="grid gap-4 sm:grid-cols-2">
                <Field label="처리 상태" value={meta?.label ?? ""} />
                {request.status === "partial" && (
                  <Field
                    label="가능 시간"
                    value={`${request.approvedStartTime ?? "-"} ~ ${request.approvedEndTime ?? "-"}`}
                  />
                )}
                {request.memo && (
                  <Field label="메모" value={request.memo} full />
                )}
              </dl>
            </div>
          )}

          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              요청 생성: {new Date(request.createdAt).toLocaleString("ko-KR")}
            </p>
          </div>
        </div>

        {canCancel && (
          <Button
            variant="outline"
            className="mt-4 w-full text-destructive hover:bg-destructive/10"
            onClick={() => setConfirmCancel(true)}
          >
            <Trash2 className="h-4 w-4" /> 요청 취소하기
          </Button>
        )}
      </div>

      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>요청을 취소할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              취소한 요청은 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>닫기</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => requestId && cancelMutation.mutate({ requestId })}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? "취소 중..." : "요청 취소"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Field({
  label,
  value,
  full,
}: {
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div className={cn(full && "sm:col-span-2")}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium text-foreground">{value}</dd>
    </div>
  );
}
