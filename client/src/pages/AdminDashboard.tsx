import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import AppNav from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import {
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MapPin,
  Package,
  User as UserIcon,
  Inbox,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { STATUS_META } from "@/lib/constants";
import { cn } from "@/lib/utils";

type ProcStatus = "approved" | "partial" | "rejected";

function StatusIcon({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const cls = cn("h-5 w-5", className);
  switch (status) {
    case "pending":
      return <Clock className={cn(cls, "text-warning")} />;
    case "approved":
      return <CheckCircle2 className={cn(cls, "text-success")} />;
    case "partial":
      return <AlertCircle className={cn(cls, "text-info")} />;
    case "rejected":
      return <XCircle className={cn(cls, "text-destructive")} />;
    default:
      return null;
  }
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const [selected, setSelected] = useState<any>(null);
  const [procStatus, setProcStatus] = useState<ProcStatus | null>(null);
  const [approvedStartTime, setApprovedStartTime] = useState("");
  const [approvedEndTime, setApprovedEndTime] = useState("");
  const [memo, setMemo] = useState("");
  const [tab, setTab] = useState<"pending" | "processed">("pending");

  const { data: requests, isLoading } =
    trpc.requests.listByDepartment.useQuery();
  const updateStatus = trpc.requests.updateStatus.useMutation();

  const resetDialog = () => {
    setSelected(null);
    setProcStatus(null);
    setApprovedStartTime("");
    setApprovedEndTime("");
    setMemo("");
  };

  const handleProcess = async () => {
    if (!selected || !procStatus) return;
    if (procStatus === "partial" && (!approvedStartTime || !approvedEndTime)) {
      toast.error("가능한 시간 범위를 입력해주세요.");
      return;
    }
    try {
      await updateStatus.mutateAsync({
        requestId: selected.id,
        status: procStatus,
        approvedStartTime:
          procStatus === "partial" ? approvedStartTime : undefined,
        approvedEndTime: procStatus === "partial" ? approvedEndTime : undefined,
        memo: memo || undefined,
      });
      toast.success("요청이 처리되었습니다.");
      utils.requests.listByDepartment.invalidate();
      resetDialog();
    } catch (e: any) {
      toast.error(e.message || "처리 중 오류가 발생했습니다.");
    }
  };

  const list = requests ?? [];
  const pending = list.filter(r => r.status === "pending");
  const processed = list.filter(r => r.status !== "pending");
  const shown = tab === "pending" ? pending : processed;

  const titleOf = (r: any) =>
    r.type === "space"
      ? (r.roomName ?? "장소 대여")
      : (r.itemName ?? "물품 대여");

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <div className="container py-8">
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-bold text-foreground">
            협조요청 관리
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {user?.department ? `${user.department} 담당` : "담당 부서"} ·
            요청을 검토하고 처리하세요.
          </p>
        </div>

        {!user?.department && (
          <div className="card-elegant mb-6 border-warning/40 bg-warning/5 text-sm text-foreground">
            담당 부서가 설정되지 않았습니다. 프로필에서 부서를 먼저
            선택해주세요.
          </div>
        )}

        {/* 탭 */}
        <div className="mb-5 inline-flex rounded-lg border border-border bg-card p-1">
          {[
            {
              key: "pending" as const,
              label: `대기 중`,
              count: pending.length,
            },
            {
              key: "processed" as const,
              label: `처리됨`,
              count: processed.length,
            },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                tab === t.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : shown.length > 0 ? (
          <div className="space-y-3">
            {shown.map(request => {
              const meta = STATUS_META[request.status];
              return (
                <div key={request.id} className="card-elegant !p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <StatusIcon status={request.status} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {request.type === "space" ? (
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : (
                            <Package className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                          <h3 className="truncate font-semibold text-foreground">
                            {titleOf(request)}
                          </h3>
                        </div>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <UserIcon className="h-3.5 w-3.5" />
                            {request.requesterName ?? "신청자"}
                            {request.requesterDepartment
                              ? ` (${request.requesterDepartment})`
                              : ""}
                          </span>
                          <span>·</span>
                          <span>
                            {request.requestDate} {request.startTime}~
                            {request.endTime}
                          </span>
                        </p>
                      </div>
                    </div>
                    {request.status === "pending" ? (
                      <Button size="sm" onClick={() => setSelected(request)}>
                        처리하기
                      </Button>
                    ) : (
                      <span className={meta?.badgeClass}>{meta?.label}</span>
                    )}
                  </div>
                  {request.purpose && (
                    <p className="mt-2 border-t border-border/60 pt-2 text-sm text-muted-foreground">
                      목적: {request.purpose}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card-elegant flex flex-col items-center py-16 text-center">
            <Inbox className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-muted-foreground">
              {tab === "pending"
                ? "대기 중인 요청이 없습니다."
                : "처리된 요청이 없습니다."}
            </p>
          </div>
        )}
      </div>

      {/* 처리 다이얼로그 */}
      <Dialog open={!!selected} onOpenChange={open => !open && resetDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>협조요청 처리</DialogTitle>
            <DialogDescription>
              요청 내용을 확인하고 처리 상태를 선택하세요.
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <div className="rounded-lg bg-secondary/50 p-4 text-sm">
                <p className="font-semibold text-foreground">
                  {titleOf(selected)}
                </p>
                <p className="mt-1 text-muted-foreground">
                  신청자: {selected.requesterName ?? "-"}
                  {selected.requesterDepartment
                    ? ` (${selected.requesterDepartment})`
                    : ""}
                </p>
                <p className="text-muted-foreground">
                  {selected.requestDate} {selected.startTime}~{selected.endTime}
                  {selected.type === "item" && selected.itemQuantity
                    ? ` · 수량 ${selected.itemQuantity}`
                    : ""}
                </p>
                {selected.purpose && (
                  <p className="mt-1 text-muted-foreground">
                    목적: {selected.purpose}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium">처리 상태</Label>
                <div className="mt-2 grid gap-2">
                  {[
                    {
                      key: "approved" as const,
                      title: "가능",
                      desc: "요청 시간대 전체 승인",
                      active: "border-success bg-success/10",
                    },
                    {
                      key: "partial" as const,
                      title: "일부가능",
                      desc: "가능한 시간대만 승인",
                      active: "border-info bg-info/10",
                    },
                    {
                      key: "rejected" as const,
                      title: "어려움",
                      desc: "요청 거절",
                      active: "border-destructive bg-destructive/10",
                    },
                  ].map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => {
                        setProcStatus(opt.key);
                        if (opt.key !== "partial") {
                          setApprovedStartTime("");
                          setApprovedEndTime("");
                        }
                      }}
                      className={cn(
                        "flex items-center justify-between rounded-lg border-2 p-3 text-left transition-all",
                        procStatus === opt.key
                          ? opt.active
                          : "border-border hover:border-muted-foreground/40"
                      )}
                    >
                      <span>
                        <span className="block font-medium text-foreground">
                          {opt.title}
                        </span>
                        <span className="block text-sm text-muted-foreground">
                          {opt.desc}
                        </span>
                      </span>
                      {procStatus === opt.key && (
                        <Check className="h-4 w-4 text-foreground" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {procStatus === "partial" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="ast" className="text-sm font-medium">
                      가능 시작
                    </Label>
                    <Input
                      id="ast"
                      type="time"
                      value={approvedStartTime}
                      onChange={e => setApprovedStartTime(e.target.value)}
                      className="input-elegant mt-1.5 w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="aet" className="text-sm font-medium">
                      가능 종료
                    </Label>
                    <Input
                      id="aet"
                      type="time"
                      value={approvedEndTime}
                      onChange={e => setApprovedEndTime(e.target.value)}
                      className="input-elegant mt-1.5 w-full"
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="memo" className="text-sm font-medium">
                  메모 <span className="text-muted-foreground">(선택)</span>
                </Label>
                <Textarea
                  id="memo"
                  placeholder="사유 또는 안내사항을 입력하세요"
                  value={memo}
                  onChange={e => setMemo(e.target.value)}
                  className="input-elegant mt-1.5 w-full"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={resetDialog}
                >
                  취소
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleProcess}
                  disabled={!procStatus || updateStatus.isPending}
                >
                  {updateStatus.isPending ? "처리 중..." : "처리 완료"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
