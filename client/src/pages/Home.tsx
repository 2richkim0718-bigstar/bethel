import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ArrowRight, CheckCircle, Users, Calendar, Bell } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 네비게이션 */}
      <nav className="border-b-2 border-slate-200 bg-white shadow-sm">
        <div className="container flex items-center justify-between py-4">
          <div className="text-2xl font-bold text-accent">ChurchLink</div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-slate-600">{user?.name || "사용자"}</span>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    대시보드
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <a href={getLoginUrl()}>
                  <Button variant="outline" size="sm">
                    로그인
                  </Button>
                </a>
                <Link href="/signup">
                  <Button size="sm">회원가입</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <section className="container py-20 text-center">
        <h1 className="mb-6 text-5xl font-bold text-slate-900">
          교회 장소·물품 대여를
          <br />
          <span className="text-accent">디지털로 관리하세요</span>
        </h1>
        <p className="mb-8 text-xl text-slate-600">
          성도와 목사님 간의 협조요청을 간편하게 처리하고,
          <br />
          실시간 알림으로 신청 상태를 추적하세요.
        </p>
        <div className="flex justify-center gap-4">
          {!isAuthenticated && (
            <>
              <a href={getLoginUrl()}>
                <Button size="lg" className="gap-2">
                  로그인 <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
              <Link href="/signup">
                <Button size="lg" variant="outline">
                  회원가입
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* 기능 소개 */}
      <section className="bg-white py-16">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">주요 기능</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* 기능 카드 1 */}
            <div className="card-elegant">
              <Calendar className="mb-4 h-8 w-8 text-accent" />
              <h3 className="mb-2 font-semibold text-slate-900">간편한 신청</h3>
              <p className="text-sm text-slate-600">
                날짜, 시간, 목적을 선택하고 클릭 몇 번으로 협조요청을 완료하세요.
              </p>
            </div>

            {/* 기능 카드 2 */}
            <div className="card-elegant">
              <Users className="mb-4 h-8 w-8 text-accent" />
              <h3 className="mb-2 font-semibold text-slate-900">역할별 관리</h3>
              <p className="text-sm text-slate-600">
                성도와 목사님의 역할을 구분하여 맞춤형 기능을 제공합니다.
              </p>
            </div>

            {/* 기능 카드 3 */}
            <div className="card-elegant">
              <Bell className="mb-4 h-8 w-8 text-accent" />
              <h3 className="mb-2 font-semibold text-slate-900">실시간 알림</h3>
              <p className="text-sm text-slate-600">
                승인, 부분승인, 거절 상태를 즉시 알림으로 받아보세요.
              </p>
            </div>

            {/* 기능 카드 4 */}
            <div className="card-elegant">
              <CheckCircle className="mb-4 h-8 w-8 text-accent" />
              <h3 className="mb-2 font-semibold text-slate-900">충돌 방지</h3>
              <p className="text-sm text-slate-600">
                동일 시간대 중복 신청을 자동으로 감지하고 방지합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-slate-200 bg-slate-900 py-8 text-center text-slate-400">
        <p>&copy; 2026 ChurchLink. 모든 권리 보유.</p>
      </footer>
    </div>
  );
}
