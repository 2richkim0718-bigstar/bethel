import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Plus, Calendar, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react";
import { Loader2 } from "lucide-react";

function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return <span className="badge-pending">대기 중</span>;
    case "approved":
      return <span className="badge-approved">승인됨</span>;
    case "partial":
      return <span className="badge-partial">일부 승인</span>;
    case "rejected":
      return <span className="badge-rejected">거절됨</span>;
    default:
      return null;
  }
}

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

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { data: requests, isLoading } = trpc.requests.listMy.useQuery();
  const { data: notifications } = trpc.notifications.list.useQuery();

  const unreadNotifications = notifications?.filter(n => !n.isRead) || [];

  return (
    <div style={{minHeight: "100vh", backgroundColor: "#f8fafc"}}>
      {/* 네비게이션 */}
      <nav className="border-b" style={{borderColor: "#e2e8f0", backgroundColor: "white", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"}}>
        <div className="container" style={{display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "1rem", paddingBottom: "1rem"}}>
          <div className="text-accent" style={{fontSize: "1.5rem", fontWeight: 700}}>ChurchLink</div>
          <div style={{display: "flex", alignItems: "center", gap: "1rem"}}>
            <span style={{fontSize: "0.875rem", color: "#475569"}}>{user?.name}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              로그아웃
            </Button>
          </div>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <div className="container" style={{paddingTop: "2rem", paddingBottom: "2rem"}}>
        {/* 헤더 */}
        <div className="mb-8" style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
          <div>
            <h1 style={{fontSize: "1.875rem", fontWeight: 700, color: "#0f172a"}}>내 대시보드</h1>
            <p className="mt-1" style={{color: "#475569"}}>협조요청 현황을 확인하세요</p>
          </div>
          <Link href="/request/new">
            <Button style={{gap: "0.5rem"}}>
              <Plus className="h-4 w-4" />
              새 요청 생성
            </Button>
          </Link>
        </div>

        {/* 알림 섹션 */}
        {unreadNotifications.length > 0 && (
          <div className="mb-8 card-elegant border-l-4 border-accent bg-accent/5">
            <div style={{display: "flex", alignItems: "flex-start", gap: "0.75rem"}}>
              <AlertCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <h3 style={{fontWeight: 600, color: "#0f172a"}}>새로운 알림</h3>
                <p className="mt-1" style={{fontSize: "0.875rem", color: "#475569"}}>
                  {unreadNotifications.length}개의 새로운 알림이 있습니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 요청 목록 */}
        <div>
          <h2 style={{marginBottom: "1rem", fontSize: "1.25rem", fontWeight: 700, color: "#0f172a"}}>내 협조요청</h2>
          {isLoading ? (
            <div className="py-12" style={{display: "flex", justifyContent: "center"}}>
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : requests && requests.length > 0 ? (
            <div className="space-y-3">
              {requests.map(request => (
                <Link key={request.id} href={`/request/${request.id}`}>
                  <a className="card-elegant block hover:shadow-md" style={{transition: "all 0.2s ease"}}>
                    <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                      <div style={{display: "flex", alignItems: "center", gap: "1rem"}}>
                        <div className="flex-shrink-0">
                          {getStatusIcon(request.status)}
                        </div>
                        <div>
                          <h3 style={{fontWeight: 600, color: "#0f172a"}}>
                            {request.type === "space" ? "장소 대여" : "물품 대여"}
                          </h3>
                          <p style={{fontSize: "0.875rem", color: "#475569"}}>
                            {request.requestDate} {request.startTime}~{request.endTime}
                          </p>
                        </div>
                      </div>
                      <div style={{display: "flex", alignItems: "center", gap: "0.75rem"}}>
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          ) : (
            <div className="card-elegant py-12" style={{textAlign: "center"}}>
              <Calendar className="h-12 w-12 text-slate-300" style={{marginLeft: "auto", marginRight: "auto", marginBottom: "1rem"}} />
              <p style={{color: "#475569"}}>아직 협조요청이 없습니다.</p>
              <Link href="/request/new">
                <a className="inline-block" style={{marginTop: "1rem"}}>
                  <Button>첫 요청 생성하기</Button>
                </a>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
