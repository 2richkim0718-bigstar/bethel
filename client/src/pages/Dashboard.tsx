import AppNav from "@/components/AppNav";
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
import { Link, useLocation } from "wouter";
import { useState } from "react";
import {
  Plus,
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MapPin,
  Package,
  Loader2,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { STATUS_META } from "@/lib/constants";
import { toast } from "sonner";

function StatusIcon({ status }: { status: string }) {
  const cls = "h-5 w-5";
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

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const { data: requests, isLoading } = trpc.requests.listMy.useQuery();
  const [cancelId, setCancelId] = useState<number | null>(null);

  const cancelMutation = trpc.requests.cancel.useMutation({
    onSuccess: () => {
      toast.success("요청이 취소되었습니다.");
      utils.requests.listMy.invalidate();
      setCancelId(null);
    },
    onError: e => toast.error(e.message || "취소에 실패했습니다."),
  });

  const list = requests ?? [];
  const stats = {
    total: list.length,
    pending: list.filter(r => r.status === "pending").length,
    approved: list.filter(
      r => r.status === "approved" || r.status === "partial"
    ).length,
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <div className="container py-8">
        {/* 헤더 */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">
              내 대시보드
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              협조요청 현황을 한눈에 확인하세요.
            </p>
          </div>
          <Link href="/request/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> 새 요청
            </Button>
          </Link>
        </div>

        {/* 요약 카드 */}
        <div className="mb-8 grid grid-cols-3 gap-3">
          {[
            {
              label: "전체",
              value: stats.total,
              icon: CalendarDays,
              color: "text-primary",
            },
            {
              label: "대기 중",
              value: stats.pending,
              icon: Clock,
              color: "text-warning",
            },
            {
              label: "승인됨",
              value: stats.approved,
              icon: CheckCircle2,
              color: "text-success",
            },
          ].map(s => (
            <div key={s.label} className="card-elegant !p-4">
              <s.icon className={`mb-2 h-5 w-5 ${s.color}`} />
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* 요청 목록 */}
        <h2 className="mb-3 text-lg font-semibold text-foreground">
          내 협조요청
        </h2>
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : list.length > 0 ? (
          <div className="space-y-3">
            {list.map(request => {
              const meta = STATUS_META[request.status];
              const title =
                request.type === "space"
                  ? (request.roomName ?? "장소 대여")
                  : (request.itemName ?? "물품 대여");
              return (
                <div key={request.id} className="card-elegant !p-4">
                  <div className="flex items-center gap-3">
                    <StatusIcon status={request.status} />
                    <button
                      className="min-w-0 flex-1 text-left"
                      onClick={() => setLocation(`/request/${request.id}`)}
                    >
                      <div className="flex items-center gap-2">
                        {request.type === "space" ? (
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <Package className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        <h3 className="truncate font-semibold text-foreground">
                          {title}
                        </h3>
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {request.requestDate} · {request.startTime}~
                        {request.endTime}
                      </p>
                    </button>
                    <span className={meta?.badgeClass}>{meta?.label}</span>
                    {request.status === "pending" && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="요청 취소"
                        onClick={() => setCancelId(request.id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                    <ChevronRight
                      className="hidden h-4 w-4 cursor-pointer text-muted-foreground sm:block"
                      onClick={() => setLocation(`/request/${request.id}`)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card-elegant flex flex-col items-center py-16 text-center">
            <CalendarDays className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="mb-4 text-muted-foreground">
              아직 협조요청이 없습니다.
            </p>
            <Link href="/request/new">
              <Button>
                <Plus className="h-4 w-4" /> 첫 요청 만들기
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* 취소 확인 */}
      <AlertDialog
        open={cancelId !== null}
        onOpenChange={open => !open && setCancelId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>요청을 취소할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              취소한 요청은 복구할 수 없습니다. 대기 중인 요청만 취소할 수
              있습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>닫기</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                cancelId && cancelMutation.mutate({ requestId: cancelId })
              }
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
