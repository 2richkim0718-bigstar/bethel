import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { LogIn } from "lucide-react";

export default function Login() {
  return (
    <div style={{minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc", paddingLeft: "1rem", paddingRight: "1rem"}}>
      <div className="max-w-md" style={{width: "100%"}}>
        {/* 카드 */}
        <div className="card-elegant">
          {/* 로고 */}
          <div className="mb-8" style={{textAlign: "center"}}>
            <div className="inline-block bg-accent/10" style={{marginBottom: "1rem", borderRadius: "0.5rem", padding: "0.75rem"}}>
              <LogIn className="h-6 w-6 text-accent" />
            </div>
            <h1 style={{fontSize: "1.5rem", fontWeight: 700, color: "#0f172a"}}>ChurchLink</h1>
            <p style={{marginTop: "0.5rem", fontSize: "0.875rem", color: "#475569"}}>교회 협조요청 시스템</p>
          </div>

          {/* 로그인 설명 */}
          <div className="mb-8" style={{textAlign: "center"}}>
            <h2 style={{marginBottom: "0.5rem", fontSize: "1.125rem", fontWeight: 600, color: "#0f172a"}}>로그인</h2>
            <p style={{fontSize: "0.875rem", color: "#475569"}}>
              Manus 계정으로 로그인하여 시작하세요.
            </p>
          </div>

          {/* 로그인 버튼 */}
          <a href={getLoginUrl()} className="block">
            <Button style={{width: "100%"}} size="lg">
              Manus로 로그인
            </Button>
          </a>

          {/* 구분선 */}
          <div className="section-divider my-6" />

          {/* 회원가입 링크 */}
          <div style={{textAlign: "center"}}>
            <p style={{fontSize: "0.875rem", color: "#475569"}}>
              아직 계정이 없으신가요?{" "}
              <Link href="/signup">
                <a className="text-accent hover:underline" style={{fontWeight: 500}}>회원가입</a>
              </Link>
            </p>
          </div>
        </div>

        {/* 하단 텍스트 */}
        <p className="mt-8 text-xs" style={{textAlign: "center", color: "#64748b"}}>
          로그인하면 서비스 약관에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}
