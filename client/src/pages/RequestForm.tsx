import { useState } from "react";
import AppNav from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Package,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type RequestType = "space" | "item";

export default function RequestForm() {
  const [, setLocation] = useLocation();
  const [requestType, setRequestType] = useState<RequestType | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    roomId: "",
    itemId: "",
    itemQuantity: "",
    requestDate: "",
    startTime: "",
    endTime: "",
    purpose: "",
    attendeeCount: "",
  });

  const { data: rooms } = trpc.rooms.list.useQuery();
  const { data: items } = trpc.items.list.useQuery();
  const createRequest = trpc.requests.create.useMutation();

  const set = (name: string, value: string) =>
    setForm(p => ({ ...p, [name]: value }));

  // 장소 + 날짜 + 시간이 모두 채워지면 충돌 사전 확인
  const canCheckConflict =
    requestType === "space" &&
    !!form.roomId &&
    !!form.requestDate &&
    !!form.startTime &&
    !!form.endTime;
  const { data: conflict } = trpc.requests.checkConflict.useQuery(
    {
      roomId: parseInt(form.roomId || "0"),
      requestDate: form.requestDate,
      startTime: form.startTime,
      endTime: form.endTime,
    },
    { enabled: canCheckConflict }
  );

  const selectedName =
    requestType === "space"
      ? rooms?.find(r => r.id.toString() === form.roomId)?.name
      : items?.find(i => i.id.toString() === form.itemId)?.name;

  const validate = () => {
    if (!requestType) return false;
    if (!form.requestDate || !form.startTime || !form.endTime) {
      toast.error("날짜와 시간을 모두 입력해주세요.");
      return false;
    }
    if (form.endTime <= form.startTime) {
      toast.error("종료 시간은 시작 시간보다 늦어야 합니다.");
      return false;
    }
    if (requestType === "space" && !form.roomId) {
      toast.error("장소를 선택해주세요.");
      return false;
    }
    if (requestType === "item" && !form.itemId) {
      toast.error("물품을 선택해주세요.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      await createRequest.mutateAsync({
        type: requestType!,
        roomId: requestType === "space" ? parseInt(form.roomId) : undefined,
        itemId: requestType === "item" ? parseInt(form.itemId) : undefined,
        itemQuantity: form.itemQuantity
          ? parseInt(form.itemQuantity)
          : undefined,
        requestDate: form.requestDate,
        startTime: form.startTime,
        endTime: form.endTime,
        purpose: form.purpose || undefined,
        attendeeCount: form.attendeeCount
          ? parseInt(form.attendeeCount)
          : undefined,
      });
      setConfirmOpen(false);
      setSubmitted(true);
    } catch (e: any) {
      toast.error(e.message || "요청 생성에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <div className="container max-w-2xl py-8">
        {submitted ? (
          <div className="card-elegant flex flex-col items-center py-14 text-center animate-fade-in">
            <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <h2 className="font-serif text-2xl font-bold text-foreground">
              요청이 접수되었습니다!
            </h2>
            <p className="mt-2 text-muted-foreground">
              담당 목사님이 곧 검토합니다. 결과는 알림으로 받아보세요.
            </p>
            <Button className="mt-6" onClick={() => setLocation("/dashboard")}>
              대시보드로 돌아가기
            </Button>
          </div>
        ) : !requestType ? (
          <div className="animate-fade-in">
            <h1 className="font-serif text-2xl font-bold text-foreground">
              협조요청 신청
            </h1>
            <p className="mb-6 mt-1 text-sm text-muted-foreground">
              요청 종류를 선택해주세요.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                onClick={() => setRequestType("space")}
                className="card-elegant border-2 border-transparent text-left transition-all hover:border-primary/50"
              >
                <MapPin className="mb-3 h-7 w-7 text-primary" />
                <h3 className="mb-1 text-lg font-semibold text-foreground">
                  장소 대여
                </h3>
                <p className="text-sm text-muted-foreground">
                  뮤직홀, 오픈홀, 교육관 등
                </p>
              </button>
              <button
                onClick={() => setRequestType("item")}
                className="card-elegant border-2 border-transparent text-left transition-all hover:border-primary/50"
              >
                <Package className="mb-3 h-7 w-7 text-primary" />
                <h3 className="mb-1 text-lg font-semibold text-foreground">
                  물품 대여
                </h3>
                <p className="text-sm text-muted-foreground">
                  빔 프로젝터, 마이크, 비품 등
                </p>
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <button
              onClick={() => setRequestType(null)}
              className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> 종류 다시 선택
            </button>
            <h1 className="mb-6 font-serif text-2xl font-bold text-foreground">
              {requestType === "space" ? "장소 대여" : "물품 대여"} 신청
            </h1>

            <div className="card-elegant space-y-5">
              <div>
                <Label className="text-sm font-medium">
                  {requestType === "space" ? "장소 선택" : "물품 선택"}
                </Label>
                <Select
                  value={requestType === "space" ? form.roomId : form.itemId}
                  onValueChange={v =>
                    set(requestType === "space" ? "roomId" : "itemId", v)
                  }
                >
                  <SelectTrigger className="input-elegant mt-1.5 w-full">
                    <SelectValue
                      placeholder={
                        requestType === "space"
                          ? "장소를 선택하세요"
                          : "물품을 선택하세요"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {(requestType === "space" ? rooms : items)?.map(
                      (it: any) => (
                        <SelectItem key={it.id} value={it.id.toString()}>
                          {it.name}
                          {it.capacity ? ` · ${it.capacity}석` : ""}
                          {it.quantity != null && requestType === "item"
                            ? ` · 보유 ${it.quantity}`
                            : ""}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="requestDate" className="text-sm font-medium">
                  요청 날짜
                </Label>
                <Input
                  id="requestDate"
                  type="date"
                  value={form.requestDate}
                  onChange={e => set("requestDate", e.target.value)}
                  className="input-elegant mt-1.5 w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime" className="text-sm font-medium">
                    시작 시간
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={form.startTime}
                    onChange={e => set("startTime", e.target.value)}
                    className="input-elegant mt-1.5 w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="endTime" className="text-sm font-medium">
                    종료 시간
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={form.endTime}
                    onChange={e => set("endTime", e.target.value)}
                    className="input-elegant mt-1.5 w-full"
                  />
                </div>
              </div>

              {/* 충돌 경고 */}
              {canCheckConflict && conflict?.hasConflict && (
                <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning" />
                  <p className="text-foreground">
                    해당 시간대에 이미 승인된 요청이 있습니다. 신청은 가능하며,
                    담당 목사님이 최종 판단합니다.
                  </p>
                </div>
              )}

              {requestType === "item" && (
                <div>
                  <Label htmlFor="itemQuantity" className="text-sm font-medium">
                    수량
                  </Label>
                  <Input
                    id="itemQuantity"
                    type="number"
                    min="1"
                    value={form.itemQuantity}
                    onChange={e => set("itemQuantity", e.target.value)}
                    className="input-elegant mt-1.5 w-full"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="attendeeCount" className="text-sm font-medium">
                  참석 인원{" "}
                  <span className="text-muted-foreground">(선택)</span>
                </Label>
                <Input
                  id="attendeeCount"
                  type="number"
                  min="1"
                  value={form.attendeeCount}
                  onChange={e => set("attendeeCount", e.target.value)}
                  className="input-elegant mt-1.5 w-full"
                />
              </div>

              <div>
                <Label htmlFor="purpose" className="text-sm font-medium">
                  사용 목적{" "}
                  <span className="text-muted-foreground">(선택)</span>
                </Label>
                <Textarea
                  id="purpose"
                  placeholder="사용 목적을 입력해주세요"
                  value={form.purpose}
                  onChange={e => set("purpose", e.target.value)}
                  className="input-elegant mt-1.5 w-full"
                  rows={3}
                />
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => validate() && setConfirmOpen(true)}
              >
                신청 내용 확인
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 확인 다이얼로그 (Step 3) */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>이대로 신청하시겠습니까?</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-1.5 rounded-lg bg-secondary/50 p-4 text-sm">
            <Row
              label="종류"
              value={requestType === "space" ? "장소 대여" : "물품 대여"}
            />
            <Row
              label={requestType === "space" ? "장소" : "물품"}
              value={selectedName ?? "-"}
            />
            <Row label="날짜" value={form.requestDate} />
            <Row label="시간" value={`${form.startTime} ~ ${form.endTime}`} />
            {requestType === "item" && form.itemQuantity && (
              <Row label="수량" value={form.itemQuantity} />
            )}
            {form.attendeeCount && (
              <Row label="참석 인원" value={`${form.attendeeCount}명`} />
            )}
            {form.purpose && <Row label="목적" value={form.purpose} />}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>수정하기</AlertDialogCancel>
            <AlertDialogAction
              onClick={e => {
                e.preventDefault();
                handleSubmit();
              }}
              disabled={createRequest.isPending}
            >
              {createRequest.isPending ? "신청 중..." : "신청하기"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn("flex justify-between gap-4")}>
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}
