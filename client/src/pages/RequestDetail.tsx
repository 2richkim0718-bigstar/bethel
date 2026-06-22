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
      <div style={{minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc"}}>
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!request) {
    return (
      <div style={{minHeight: "100vh", backgroundColor: "#f8fafc"}}>
        <nav className="border-b" style={{borderColor: "#e2e8f0", backgroundColor: "white", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"}}>
          <div className="container" style={{display: "flex", alignItems: "center", gap: "1rem", paddingTop: "1rem", paddingBottom: "1rem"}}>
            <button onClick={() => setLocation("/dashboard")} className="hover:text-slate-900" style={{color: "#475569"}}>
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="text-accent" style={{fontSize: "1.5rem", fontWeight: 700}}>ChurchLink</div>
          </div>
        </nav>
        <div className="container py-12" style={{textAlign: "center"}}>
          <p style={{color: "#475569"}}>요청을 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight: "100vh", backgroundColor: "#f8fafc"}}>
      {/* 네비게이션 */}
      <nav className="border-b" style={{borderColor: "#e2e8f0", backgroundColor: "white", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"}}>
        <div className="container" style={{display: "flex", alignItems: "center", gap: "1rem", paddingTop: "1rem", paddingBottom: "1rem"}}>
          <button onClick={() => setLocation("/dashboard")} className="hover:text-slate-900" style={{color: "#475569"}}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="text-accent" style={{fontSize: "1.5rem", fontWeight: 700}}>ChurchLink</div>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <div className="container" style={{paddingTop: "2rem", paddingBottom: "2rem"}}>
        <div className="max-w-2xl" style={{marginLeft: "auto", marginRight: "auto"}}>
          {/* 상태 헤더 */}
          <div className="card-elegant" style={{marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1rem"}}>
            <div className="flex-shrink-0">
              {getStatusIcon(request.status)}
            </div>
            <div>
              <h1 style={{fontSize: "1.5rem", fontWeight: 700, color: "#0f172a"}}>
                {request.type === "space" ? "장소 대여" : "물품 대여"} 요청
              </h1>
              <p style={{fontSize: "0.875rem", color: "#475569"}}>
                상태: <span style={{fontWeight: 600}}>{getStatusText(request.status)}</span>
              </p>
            </div>
          </div>

          {/* 상세 정보 */}
          <div className="card-elegant space-y-6">
            {/* 기본 정보 */}
            <div>
              <h2 style={{marginBottom: "1rem", fontSize: "1.125rem", fontWeight: 600, color: "#0f172a"}}>기본 정보</h2>
              <div className="grid md:grid-cols-2" style={{gap: "1rem"}}>
                <div>
                  <p style={{fontSize: "0.875rem", color: "#475569"}}>요청 날짜</p>
                  <p style={{fontWeight: 500, color: "#0f172a"}}>{request.requestDate}</p>
                </div>
                <div>
                  <p style={{fontSize: "0.875rem", color: "#475569"}}>요청 시간</p>
                  <p style={{fontWeight: 500, color: "#0f172a"}}>
                    {request.startTime} ~ {request.endTime}
                  </p>
                </div>
                {request.attendeeCount && (
                  <div>
                    <p style={{fontSize: "0.875rem", color: "#475569"}}>참석 인원</p>
                    <p style={{fontWeight: 500, color: "#0f172a"}}>{request.attendeeCount}명</p>
                  </div>
                )}
                {request.purpose && (
                  <div className="md:col-span-2">
                    <p style={{fontSize: "0.875rem", color: "#475569"}}>사용 목적</p>
                    <p style={{fontWeight: 500, color: "#0f172a"}}>{request.purpose}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 처리 정보 */}
            {(request.status === "approved" || request.status === "partial" || request.status === "rejected") && (
              <div className="border-t pt-6" style={{borderColor: "#e2e8f0"}}>
                <h2 style={{marginBottom: "1rem", fontSize: "1.125rem", fontWeight: 600, color: "#0f172a"}}>처리 결과</h2>
                <div className="grid md:grid-cols-2" style={{gap: "1rem"}}>
                  <div>
                    <p style={{fontSize: "0.875rem", color: "#475569"}}>처리 상태</p>
                    <p style={{fontWeight: 500, color: "#0f172a"}}>{getStatusText(request.status)}</p>
                  </div>
                  {request.status === "partial" && (
                    <>
                      <div>
                        <p style={{fontSize: "0.875rem", color: "#475569"}}>가능 시간</p>
                        <p style={{fontWeight: 500, color: "#0f172a"}}>
                          {request.approvedStartTime} ~ {request.approvedEndTime}
                        </p>
                      </div>
                    </>
                  )}
                  {request.memo && (
                    <div className="md:col-span-2">
                      <p style={{fontSize: "0.875rem", color: "#475569"}}>메모</p>
                      <p style={{fontWeight: 500, color: "#0f172a"}}>{request.memo}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 생성 정보 */}
            <div className="border-t pt-6" style={{borderColor: "#e2e8f0"}}>
              <p className="text-xs" style={{color: "#64748b"}}>
                요청 생성: {new Date(request.createdAt).toLocaleString("ko-KR")}
              </p>
            </div>
          </div>

          {/* 버튼 */}
          <div style={{marginTop: "1.5rem"}}>
            <Button variant="outline" style={{width: "100%"}} onClick={() => setLocation("/dashboard")}>
              돌아가기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
