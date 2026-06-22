import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { LogIn } from "lucide-react";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md">
        {/* 카드 */}
        <div className="card-elegant">
          {/* 로고 */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-block rounded-lg bg-accent/10 p-3">
              <LogIn className="h-6 w-6 text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">ChurchLink</h1>
            <p className="mt-2 text-sm text-slate-600">교회 협조요청 시스템</p>
          </div>

          {/* 로그인 설명 */}
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-lg font-semibold text-slate-900">로그인</h2>
            <p className="text-sm text-slate-600">
              Manus 계정으로 로그인하여 시작하세요.
            </p>
          </div>

          {/* 로그인 버튼 */}
          <a href={getLoginUrl()} className="block">
            <Button className="w-full" size="lg">
              Manus로 로그인
            </Button>
          </a>

          {/* 구분선 */}
          <div className="section-divider my-6" />

          {/* 회원가입 링크 */}
          <div className="text-center">
            <p className="text-sm text-slate-600">
              아직 계정이 없으신가요?{" "}
              <Link href="/signup">
                <a className="font-medium text-accent hover:underline">회원가입</a>
              </Link>
            </p>
          </div>
        </div>

        {/* 하단 텍스트 */}
        <p className="mt-8 text-center text-xs text-slate-500">
          로그인하면 서비스 약관에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}
