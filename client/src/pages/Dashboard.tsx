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
    <div className="min-h-screen bg-slate-50">
      {/* 네비게이션 */}
      <nav className="border-b border-slate-200 bg-white shadow-sm">
        <div className="container flex items-center justify-between py-4">
          <div className="text-2xl font-bold text-accent">ChurchLink</div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user?.name}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              로그아웃
            </Button>
          </div>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <div className="container py-8">
        {/* 헤더 */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">내 대시보드</h1>
            <p className="mt-1 text-slate-600">협조요청 현황을 확인하세요</p>
          </div>
          <Link href="/request/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              새 요청 생성
            </Button>
          </Link>
        </div>

        {/* 알림 섹션 */}
        {unreadNotifications.length > 0 && (
          <div className="mb-8 card-elegant border-l-4 border-accent bg-accent/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-slate-900">새로운 알림</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {unreadNotifications.length}개의 새로운 알림이 있습니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 요청 목록 */}
        <div>
          <h2 className="mb-4 text-xl font-bold text-slate-900">내 협조요청</h2>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : requests && requests.length > 0 ? (
            <div className="space-y-3">
              {requests.map(request => (
                <Link key={request.id} href={`/request/${request.id}`}>
                  <a className="card-elegant block transition-all hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          {getStatusIcon(request.status)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {request.type === "space" ? "장소 대여" : "물품 대여"}
                          </h3>
                          <p className="text-sm text-slate-600">
                            {request.requestDate} {request.startTime}~{request.endTime}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          ) : (
            <div className="card-elegant text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-4" />
              <p className="text-slate-600">아직 협조요청이 없습니다.</p>
              <Link href="/request/new">
                <a className="mt-4 inline-block">
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
