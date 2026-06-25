import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { DEPARTMENTS } from "@/lib/constants";
import { Church, ArrowLeft, HandHelping, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Role = "pastor" | "member";

export default function Signup() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const [role, setRole] = useState<Role>("member");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");

  const register = trpc.auth.register.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password || !name.trim() || !department) {
      toast.error("모든 필수 항목을 입력해주세요.");
      return;
    }
    if (password.length < 4) {
      toast.error("비밀번호는 4자 이상이어야 합니다.");
      return;
    }
    if (password !== passwordConfirm) {
      toast.error("비밀번호가 일치하지 않습니다.");
      return;
    }
    try {
      const user = await register.mutateAsync({
        username: username.trim(),
        password,
        name: name.trim(),
        role,
        department,
      });
      await utils.auth.me.invalidate();
      toast.success("가입이 완료되었습니다.");
      setLocation(user.role === "admin" ? "/admin/requests" : "/dashboard");
    } catch (err: any) {
      toast.error(err.message || "가입에 실패했습니다.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-secondary/40 to-background px-4 py-10">
      <div className="w-full max-w-md animate-fade-in">
        <Link href="/">
          <span className="mb-6 inline-flex cursor-pointer items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> 홈으로
          </span>
        </Link>

        <div className="card-elegant">
          <div className="mb-6 text-center">
            <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Church className="h-6 w-6" />
            </span>
            <h1 className="font-serif text-2xl font-bold text-foreground">
              회원가입
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              아이디와 비밀번호만으로 간편하게 시작하세요.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 역할 선택 */}
            <div>
              <Label className="text-sm font-medium">역할</Label>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {[
                  { key: "member" as const, label: "성도", Icon: HandHelping },
                  {
                    key: "pastor" as const,
                    label: "목사님",
                    Icon: ShieldCheck,
                  },
                ].map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setRole(key)}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-lg border-2 py-2.5 text-sm font-medium transition-all",
                      role === key
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="username" className="text-sm font-medium">
                아이디
              </Label>
              <Input
                id="username"
                autoComplete="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="영문/숫자 (예: gildong)"
                className="input-elegant mt-1.5 w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="password" className="text-sm font-medium">
                  비밀번호
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="4자 이상"
                  className="input-elegant mt-1.5 w-full"
                />
              </div>
              <div>
                <Label
                  htmlFor="passwordConfirm"
                  className="text-sm font-medium"
                >
                  비밀번호 확인
                </Label>
                <Input
                  id="passwordConfirm"
                  type="password"
                  autoComplete="new-password"
                  value={passwordConfirm}
                  onChange={e => setPasswordConfirm(e.target.value)}
                  placeholder="다시 입력"
                  className="input-elegant mt-1.5 w-full"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                이름
              </Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                className="input-elegant mt-1.5 w-full"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">
                {role === "pastor" ? "담당 부서" : "소속 부서"}
              </Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="input-elegant mt-1.5 w-full">
                  <SelectValue placeholder="부서를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map(d => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {role === "pastor" && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  선택한 부서의 장소·물품 요청을 담당하게 됩니다.
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={register.isPending}
            >
              {register.isPending ? "가입 중..." : "가입하고 시작하기"}
            </Button>
          </form>

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
