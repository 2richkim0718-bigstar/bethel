import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Church, ShieldCheck, ArrowLeft } from "lucide-react";

export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-secondary/40 to-background px-4">
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
              ChurchLink
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              교회 협조요청 시스템
            </p>
          </div>

          <div className="mb-6 text-center">
            <h2 className="mb-1 text-lg font-semibold text-foreground">
              로그인 / 시작하기
            </h2>
            <p className="text-sm text-muted-foreground">
              Manus 계정으로 안전하게 로그인하세요.
              <br />
              처음이시면 로그인 후 역할을 선택하게 됩니다.
            </p>
          </div>

          <a href={getLoginUrl()} className="block">
            <Button className="w-full" size="lg">
              Manus로 계속하기
            </Button>
          </a>

          <div className="section-divider my-6" />

          <div className="flex items-start gap-2 rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
            <p>
              로그인하면 서비스 약관 및 개인정보 처리방침에 동의하는 것으로
              간주됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
