import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowRight,
  CheckCircle2,
  Users,
  CalendarCheck,
  Bell,
  Church,
  ShieldCheck,
  Clock,
} from "lucide-react";

const FEATURES = [
  {
    icon: CalendarCheck,
    title: "간편한 신청",
    desc: "장소·물품, 날짜와 시간을 고르면 몇 번의 클릭으로 협조요청이 완료됩니다.",
  },
  {
    icon: Users,
    title: "역할별 화면",
    desc: "성도와 목사님의 화면을 분리해 각자에게 꼭 필요한 기능만 보여줍니다.",
  },
  {
    icon: Bell,
    title: "실시간 알림",
    desc: "승인·일부승인·반려 결과를 인앱 알림으로 즉시 받아보세요.",
  },
  {
    icon: ShieldCheck,
    title: "중복 방지",
    desc: "같은 장소·시간대의 중복 신청을 자동으로 감지해 안내합니다.",
  },
];

const STEPS = [
  { step: "01", title: "신청", desc: "성도가 장소·물품 대여를 요청합니다." },
  {
    step: "02",
    title: "알림",
    desc: "담당 목사님에게 즉시 알림이 전달됩니다.",
  },
  { step: "03", title: "처리", desc: "가능·일부가능·어려움으로 응답합니다." },
  { step: "04", title: "확인", desc: "신청자가 결과 알림을 받습니다." },
];

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const homePath = user?.role === "admin" ? "/admin/requests" : "/dashboard";

  return (
    <div className="min-h-screen bg-background">
      {/* 네비게이션 */}
      <nav className="sticky top-0 z-30 border-b border-border/70 bg-card/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Church className="h-5 w-5" />
            </span>
            <span className="font-serif text-xl font-bold text-foreground">
              ChurchLink
            </span>
          </span>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Link href={homePath}>
                <Button size="sm">대시보드로 이동</Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button size="sm" variant="outline">
                    로그인
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">회원가입</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* 히어로 */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-secondary/50 via-background to-background" />
        <div className="container py-20 text-center md:py-28">
          <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            교회 장소·물품 대여 협조요청 시스템
          </span>
          <h1 className="mx-auto max-w-3xl font-serif text-4xl font-bold leading-tight text-foreground md:text-5xl">
            교회의 공간과 물품을
            <br />
            <span className="text-primary">은혜롭게, 질서있게</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            성도와 목사님 사이의 협조요청을 한곳에서. 신청부터 승인, 알림까지
            번거로움 없이 처리하세요.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {isAuthenticated ? (
              <Link href={homePath}>
                <Button size="lg" className="gap-2">
                  대시보드로 이동 <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/signup">
                  <Button size="lg" className="gap-2">
                    시작하기 <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline">
                    로그인
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 주요 기능 */}
      <section className="container py-16">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground">
            주요 기능
          </h2>
          <p className="mt-2 text-muted-foreground">
            꼭 필요한 기능만 담았습니다.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card-elegant">
              <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mb-1.5 font-semibold text-foreground">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 진행 흐름 */}
      <section className="border-y border-border bg-secondary/30 py-16">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-3xl font-bold text-foreground">
              진행 흐름
            </h2>
            <p className="mt-2 text-muted-foreground">
              신청에서 결과 확인까지 4단계.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ step, title, desc }, i) => (
              <div key={step} className="relative">
                <div className="card-elegant h-full">
                  <span className="font-serif text-2xl font-bold text-gold">
                    {step}
                  </span>
                  <h3 className="mb-1 mt-2 font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-border lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20 text-center">
        <Clock className="mx-auto mb-4 h-10 w-10 text-gold" />
        <h2 className="font-serif text-3xl font-bold text-foreground">
          지금 시작해보세요
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          몇 분이면 충분합니다. 로그인 후 역할을 선택하면 바로 사용할 수
          있습니다.
        </p>
        {!isAuthenticated && (
          <Link href="/signup">
            <Button size="lg" className="mt-6 gap-2">
              <CheckCircle2 className="h-4 w-4" /> 회원가입하고 시작하기
            </Button>
          </Link>
        )}
      </section>

      {/* 푸터 */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container flex flex-col items-center gap-2 text-center">
          <span className="flex items-center gap-2 font-serif font-bold text-foreground">
            <Church className="h-4 w-4 text-primary" /> ChurchLink
          </span>
          <p className="text-xs text-muted-foreground">
            &copy; 2026 ChurchLink. 교회 협조요청 시스템.
          </p>
        </div>
      </footer>
    </div>
  );
}
