import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Church, ArrowLeft, LogIn, UserCog, PartyPopper } from "lucide-react";

const STEPS = [
  {
    icon: LogIn,
    title: "1. 로그인",
    desc: "Manus 계정으로 안전하게 로그인합니다.",
  },
  {
    icon: UserCog,
    title: "2. 역할·부서 선택",
    desc: "성도/목사님을 고르고 소속 부서를 입력합니다.",
  },
  {
    icon: PartyPopper,
    title: "3. 바로 시작",
    desc: "역할에 맞는 화면에서 곧바로 사용합니다.",
  },
];

export default function Signup() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-secondary/40 to-background px-4 py-10">
      <div className="w-full max-w-md animate-fade-in">
        <Link href="/">
          <span className="mb-6 inline-flex cursor-pointer items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> 홈으로
          </span>
        </Link>

        <div className="card-elegant">
          <div className="mb-8 text-center">
            <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Church className="h-6 w-6" />
            </span>
            <h1 className="font-serif text-2xl font-bold text-foreground">
              가입은 이렇게 진행돼요
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              별도의 비밀번호 없이 3단계로 시작합니다.
            </p>
          </div>

          <div className="space-y-3">
            {STEPS.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-3 rounded-lg border border-border p-3"
              >
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <a href={getLoginUrl()} className="mt-6 block">
            <Button className="w-full" size="lg">
              로그인하고 시작하기
            </Button>
          </a>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            이미 계정이 있으신가요?{" "}
            <Link href="/login">
              <span className="cursor-pointer font-medium text-primary hover:underline">
                로그인
              </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
