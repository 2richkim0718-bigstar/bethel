import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";

function getStatusIcon(status: string) {
  switch (status) {
    case "pending":
      return <Clock className="h-6 w-6 text-amber-500" />;
    case "approved":
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    case "partial":
      return <AlertCircle className="h-6 w-6 text-blue-500" />;
    case "rejected":
      return <XCircle className="h-6 w-6 text-red-500" />;
    default:
      return null;
  }
}

function getStatusText(status: string) {
  switch (status) {
    case "pending":
      return "대기 중";
    case "approved":
      return "승인됨";
    case "partial":
      return "일부 승인";
    case "rejected":
      return "거절됨";
    default:
      return "";
  }
}

export default function RequestDetail() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/request/:id");

  const requestId = params?.id ? parseInt(params.id) : null;
  const { data: request, isLoading } = trpc.requests.getById.useQuery(
    { id: requestId! },
    { enabled: !!requestId }
  );

  if (!match) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-slate-50">
        <nav className="border-b border-slate-200 bg-white shadow-sm">
          <div className="container flex items-center gap-4 py-4">
            <button onClick={() => setLocation("/dashboard")} className="text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="text-2xl font-bold text-accent">ChurchLink</div>
          </div>
        </nav>
        <div className="container py-12 text-center">
          <p className="text-slate-600">요청을 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 네비게이션 */}
      <nav className="border-b border-slate-200 bg-white shadow-sm">
        <div className="container flex items-center gap-4 py-4">
          <button onClick={() => setLocation("/dashboard")} className="text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="text-2xl font-bold text-accent">ChurchLink</div>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          {/* 상태 헤더 */}
          <div className="card-elegant mb-6 flex items-center gap-4">
            <div className="flex-shrink-0">
              {getStatusIcon(request.status)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {request.type === "space" ? "장소 대여" : "물품 대여"} 요청
              </h1>
              <p className="text-sm text-slate-600">
                상태: <span className="font-semibold">{getStatusText(request.status)}</span>
              </p>
            </div>
          </div>

          {/* 상세 정보 */}
          <div className="card-elegant space-y-6">
            {/* 기본 정보 */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-slate-900">기본 정보</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-600">요청 날짜</p>
                  <p className="font-medium text-slate-900">{request.requestDate}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">요청 시간</p>
                  <p className="font-medium text-slate-900">
                    {request.startTime} ~ {request.endTime}
                  </p>
                </div>
                {request.attendeeCount && (
                  <div>
                    <p className="text-sm text-slate-600">참석 인원</p>
                    <p className="font-medium text-slate-900">{request.attendeeCount}명</p>
                  </div>
                )}
                {request.purpose && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-slate-600">사용 목적</p>
                    <p className="font-medium text-slate-900">{request.purpose}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 처리 정보 */}
            {(request.status === "approved" || request.status === "partial" || request.status === "rejected") && (
              <div className="border-t border-slate-200 pt-6">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">처리 결과</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-slate-600">처리 상태</p>
                    <p className="font-medium text-slate-900">{getStatusText(request.status)}</p>
                  </div>
                  {request.status === "partial" && (
                    <>
                      <div>
                        <p className="text-sm text-slate-600">가능 시간</p>
                        <p className="font-medium text-slate-900">
                          {request.approvedStartTime} ~ {request.approvedEndTime}
                        </p>
                      </div>
                    </>
                  )}
                  {request.memo && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-slate-600">메모</p>
                      <p className="font-medium text-slate-900">{request.memo}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 생성 정보 */}
            <div className="border-t border-slate-200 pt-6">
              <p className="text-xs text-slate-500">
                요청 생성: {new Date(request.createdAt).toLocaleString("ko-KR")}
              </p>
            </div>
          </div>

          {/* 버튼 */}
          <div className="mt-6">
            <Button variant="outline" className="w-full" onClick={() => setLocation("/dashboard")}>
              돌아가기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
