import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { Church, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = trpc.auth.login.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      toast.error("아이디와 비밀번호를 입력해주세요.");
      return;
    }
    try {
      const user = await login.mutateAsync({ username, password });
      await utils.auth.me.invalidate();
      toast.success("로그인되었습니다.");
      setLocation(user.role === "admin" ? "/admin/requests" : "/dashboard");
    } catch (err: any) {
      toast.error(err.message || "로그인에 실패했습니다.");
    }
  };

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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-sm font-medium">
                아이디
              </Label>
              <Input
                id="username"
                autoComplete="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="아이디를 입력하세요"
                className="input-elegant mt-1.5 w-full"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-medium">
                비밀번호
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="input-elegant mt-1.5 w-full"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={login.isPending}
            >
              {login.isPending ? "로그인 중..." : "로그인"}
            </Button>
          </form>

          <div className="section-divider my-6" />

          <p className="text-center text-sm text-muted-foreground">
            아직 계정이 없으신가요?{" "}
            <Link href="/signup">
              <span className="cursor-pointer font-medium text-primary hover:underline">
                회원가입
              </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
