import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ArrowRight, CheckCircle, Users, Calendar, Bell } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100" style={{minHeight: "100vh"}}>
      {/* 네비게이션 */}
      <nav className="border-b-2" style={{borderColor: "#e2e8f0", backgroundColor: "white", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"}}>
        <div className="container" style={{display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "1rem", paddingBottom: "1rem"}}>
          <div className="text-accent" style={{fontSize: "1.5rem", fontWeight: 700}}>ChurchLink</div>
          <div style={{display: "flex", alignItems: "center", gap: "1rem"}}>
            {isAuthenticated ? (
              <>
                <span style={{fontSize: "0.875rem", color: "#475569"}}>{user?.name || "사용자"}</span>
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
      <section className="container" style={{paddingTop: "5rem", paddingBottom: "5rem", textAlign: "center"}}>
        <h1 style={{marginBottom: "1.5rem", fontSize: "3rem", fontWeight: 700, color: "#0f172a"}}>
          교회 장소·물품 대여를
          <br />
          <span className="text-accent">디지털로 관리하세요</span>
        </h1>
        <p className="mb-8" style={{fontSize: "1.25rem", color: "#475569"}}>
          성도와 목사님 간의 협조요청을 간편하게 처리하고,
          <br />
          실시간 알림으로 신청 상태를 추적하세요.
        </p>
        <div style={{display: "flex", justifyContent: "center", gap: "1rem"}}>
          {!isAuthenticated && (
            <>
              <a href={getLoginUrl()}>
                <Button size="lg" style={{gap: "0.5rem"}}>
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
      <section className="py-16" style={{backgroundColor: "white"}}>
        <div className="container">
          <h2 className="mb-12" style={{textAlign: "center", fontSize: "1.875rem", fontWeight: 700, color: "#0f172a"}}>주요 기능</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4" style={{gap: "2rem"}}>
            {/* 기능 카드 1 */}
            <div className="card-elegant">
              <Calendar className="h-8 w-8 text-accent" style={{marginBottom: "1rem"}} />
              <h3 style={{marginBottom: "0.5rem", fontWeight: 600, color: "#0f172a"}}>간편한 신청</h3>
              <p style={{fontSize: "0.875rem", color: "#475569"}}>
                날짜, 시간, 목적을 선택하고 클릭 몇 번으로 협조요청을 완료하세요.
              </p>
            </div>

            {/* 기능 카드 2 */}
            <div className="card-elegant">
              <Users className="h-8 w-8 text-accent" style={{marginBottom: "1rem"}} />
              <h3 style={{marginBottom: "0.5rem", fontWeight: 600, color: "#0f172a"}}>역할별 관리</h3>
              <p style={{fontSize: "0.875rem", color: "#475569"}}>
                성도와 목사님의 역할을 구분하여 맞춤형 기능을 제공합니다.
              </p>
            </div>

            {/* 기능 카드 3 */}
            <div className="card-elegant">
              <Bell className="h-8 w-8 text-accent" style={{marginBottom: "1rem"}} />
              <h3 style={{marginBottom: "0.5rem", fontWeight: 600, color: "#0f172a"}}>실시간 알림</h3>
              <p style={{fontSize: "0.875rem", color: "#475569"}}>
                승인, 부분승인, 거절 상태를 즉시 알림으로 받아보세요.
              </p>
            </div>

            {/* 기능 카드 4 */}
            <div className="card-elegant">
              <CheckCircle className="h-8 w-8 text-accent" style={{marginBottom: "1rem"}} />
              <h3 style={{marginBottom: "0.5rem", fontWeight: 600, color: "#0f172a"}}>충돌 방지</h3>
              <p style={{fontSize: "0.875rem", color: "#475569"}}>
                동일 시간대 중복 신청을 자동으로 감지하고 방지합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t" style={{borderColor: "#e2e8f0", backgroundColor: "#0f172a", paddingTop: "2rem", paddingBottom: "2rem", textAlign: "center", color: "#94a3b8"}}>
        <p>&copy; 2026 ChurchLink. 모든 권리 보유.</p>
      </footer>
    </div>
  );
}
