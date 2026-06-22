import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Loader2, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

function getStatusIcon(status: string) {
  switch (status) {
    case "pending":
      return <Clock className="h-5 w-5 text-amber-500" />;
    case "approved":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "partial":
      return <AlertCircle className="h-5 w-5 text-blue-500" />;
    case "rejected":
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return null;
  }
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [processingStatus, setProcessingStatus] = useState<"approved" | "partial" | "rejected" | null>(null);
  const [approvedStartTime, setApprovedStartTime] = useState("");
  const [approvedEndTime, setApprovedEndTime] = useState("");
  const [memo, setMemo] = useState("");

  const { data: requests, isLoading, refetch } = trpc.requests.listByDepartment.useQuery({
    department: user?.name || "",
  });

  const updateStatusMutation = trpc.requests.updateStatus.useMutation();

  const handleProcessRequest = async () => {
    if (!selectedRequest || !processingStatus) return;

    if (processingStatus === "partial" && (!approvedStartTime || !approvedEndTime)) {
      toast.error("가능한 시간 범위를 입력해주세요.");
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        requestId: selectedRequest.id,
        status: processingStatus,
        approvedStartTime: processingStatus === "partial" ? approvedStartTime : undefined,
        approvedEndTime: processingStatus === "partial" ? approvedEndTime : undefined,
        memo,
      });

      toast.success("요청이 처리되었습니다.");
      setSelectedRequest(null);
      setProcessingStatus(null);
      setApprovedStartTime("");
      setApprovedEndTime("");
      setMemo("");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "처리 중 오류가 발생했습니다.");
    }
  };

  const pendingRequests = requests?.filter(r => r.status === "pending") || [];
  const processedRequests = requests?.filter(r => r.status !== "pending") || [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 네비게이션 */}
      <nav className="border-b border-slate-200 bg-white shadow-sm">
        <div className="container flex items-center justify-between py-4">
          <div className="text-2xl font-bold text-accent">ChurchLink</div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user?.name} (목사님)</span>
            <Button variant="outline" size="sm" onClick={logout}>
              로그아웃
            </Button>
          </div>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <div className="container py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">협조요청 관리</h1>
          <p className="mt-1 text-slate-600">담당 요청을 검토하고 처리하세요</p>
        </div>

        {/* 대기 중인 요청 */}
        <div className="mb-12">
          <h2 className="mb-4 text-xl font-bold text-slate-900">
            대기 중인 요청 ({pendingRequests.length})
          </h2>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : pendingRequests.length > 0 ? (
            <div className="space-y-3">
              {pendingRequests.map(request => (
                <div key={request.id} className="card-elegant">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Clock className="h-5 w-5 text-amber-500 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {request.type === "space" ? "장소 대여" : "물품 대여"}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {request.requestDate} {request.startTime}~{request.endTime}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setSelectedRequest(request)}
                    >
                      처리하기
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-elegant text-center py-12">
              <CheckCircle className="mx-auto h-12 w-12 text-slate-300 mb-4" />
              <p className="text-slate-600">대기 중인 요청이 없습니다.</p>
            </div>
          )}
        </div>

        {/* 처리된 요청 */}
        <div>
          <h2 className="mb-4 text-xl font-bold text-slate-900">
            처리된 요청 ({processedRequests.length})
          </h2>
          {processedRequests.length > 0 ? (
            <div className="space-y-3">
              {processedRequests.map(request => (
                <div key={request.id} className="card-elegant">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(request.status)}
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {request.type === "space" ? "장소 대여" : "물품 대여"}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {request.requestDate} {request.startTime}~{request.endTime}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-slate-600">
                      {request.status === "approved" && "승인됨"}
                      {request.status === "partial" && "일부 승인"}
                      {request.status === "rejected" && "거절됨"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-elegant text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-slate-300 mb-4" />
              <p className="text-slate-600">처리된 요청이 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      {/* 요청 처리 다이얼로그 */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>협조요청 처리</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              {/* 요청 정보 */}
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-600">요청 정보</p>
                <p className="font-semibold text-slate-900">
                  {selectedRequest.type === "space" ? "장소 대여" : "물품 대여"}
                </p>
                <p className="text-sm text-slate-600">
                  {selectedRequest.requestDate} {selectedRequest.startTime}~{selectedRequest.endTime}
                </p>
              </div>

              {/* 처리 상태 선택 */}
              <div>
                <Label className="text-sm font-medium">처리 상태</Label>
                <div className="mt-2 grid gap-2">
                  <button
                    onClick={() => {
                      setProcessingStatus("approved");
                      setApprovedStartTime("");
                      setApprovedEndTime("");
                    }}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      processingStatus === "approved"
                        ? "border-green-500 bg-green-50"
                        : "border-slate-200 hover:border-green-500"
                    }`}
                  >
                    <p className="font-medium text-slate-900">가능</p>
                    <p className="text-sm text-slate-600">요청 시간대 전체 승인</p>
                  </button>

                  <button
                    onClick={() => setProcessingStatus("partial")}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      processingStatus === "partial"
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-blue-500"
                    }`}
                  >
                    <p className="font-medium text-slate-900">일부가능</p>
                    <p className="text-sm text-slate-600">가능한 시간대만 승인</p>
                  </button>

                  <button
                    onClick={() => {
                      setProcessingStatus("rejected");
                      setApprovedStartTime("");
                      setApprovedEndTime("");
                    }}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      processingStatus === "rejected"
                        ? "border-red-500 bg-red-50"
                        : "border-slate-200 hover:border-red-500"
                    }`}
                  >
                    <p className="font-medium text-slate-900">어려움</p>
                    <p className="text-sm text-slate-600">요청 거절</p>
                  </button>
                </div>
              </div>

              {/* 일부가능인 경우 시간 입력 */}
              {processingStatus === "partial" && (
                <div className="grid gap-3">
                  <div>
                    <Label htmlFor="approvedStartTime" className="text-sm font-medium">
                      가능 시작 시간
                    </Label>
                    <Input
                      id="approvedStartTime"
                      type="time"
                      value={approvedStartTime}
                      onChange={(e) => setApprovedStartTime(e.target.value)}
                      className="input-elegant mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="approvedEndTime" className="text-sm font-medium">
                      가능 종료 시간
                    </Label>
                    <Input
                      id="approvedEndTime"
                      type="time"
                      value={approvedEndTime}
                      onChange={(e) => setApprovedEndTime(e.target.value)}
                      className="input-elegant mt-1"
                    />
                  </div>
                </div>
              )}

              {/* 메모 */}
              <div>
                <Label htmlFor="memo" className="text-sm font-medium">
                  메모 (선택)
                </Label>
                <Textarea
                  id="memo"
                  placeholder="사유 또는 안내사항을 입력하세요"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="input-elegant mt-1"
                  rows={3}
                />
              </div>

              {/* 버튼 */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedRequest(null)}
                >
                  취소
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleProcessRequest}
                  disabled={!processingStatus || updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending ? "처리 중..." : "처리 완료"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
