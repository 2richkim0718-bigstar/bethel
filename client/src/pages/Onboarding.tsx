import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
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
import { useLocation } from "wouter";
import { DEPARTMENTS } from "@/lib/constants";
import {
  Church,
  HandHelping,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Role = "pastor" | "member";

export default function Onboarding() {
  const { user, refresh } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState(user?.name ?? "");
  const [age, setAge] = useState("");
  const [department, setDepartment] = useState("");

  const updateProfile = trpc.auth.updateProfile.useMutation();

  const handleSubmit = async () => {
    if (!role) return;
    if (!name.trim() || !department) {
      toast.error("이름과 부서를 입력해주세요.");
      return;
    }
    try {
      await updateProfile.mutateAsync({
        name: name.trim(),
        age: age ? parseInt(age) : undefined,
        department,
        role,
      });
      await utils.auth.me.invalidate();
      await refresh();
      toast.success("프로필이 저장되었습니다.");
      setLocation(role === "pastor" ? "/admin/requests" : "/dashboard");
    } catch (e: any) {
      toast.error(e.message || "저장에 실패했습니다.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-secondary/40 to-background px-4 py-10">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="mb-8 text-center">
          <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Church className="h-6 w-6" />
          </span>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            환영합니다!
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            시작하기 전에 프로필을 완성해주세요.
          </p>
        </div>

        {/* 진행 표시 */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {[1, 2].map(s => (
            <span
              key={s}
              className={cn(
                "h-1.5 rounded-full transition-all",
                step >= s ? "w-8 bg-primary" : "w-4 bg-border"
              )}
            />
          ))}
        </div>

        <div className="card-elegant">
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-center text-sm font-medium text-foreground">
                어떤 역할로 사용하시나요?
              </p>
              <div className="grid gap-3">
                <button
                  onClick={() => setRole("member")}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-all",
                    role === "member"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <HandHelping className="mt-0.5 h-6 w-6 flex-shrink-0 text-primary" />
                  <div>
                    <h3 className="font-semibold text-foreground">성도</h3>
                    <p className="text-sm text-muted-foreground">
                      장소와 물품 대여를 신청합니다.
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => setRole("pastor")}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-all",
                    role === "pastor"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <ShieldCheck className="mt-0.5 h-6 w-6 flex-shrink-0 text-primary" />
                  <div>
                    <h3 className="font-semibold text-foreground">목사님</h3>
                    <p className="text-sm text-muted-foreground">
                      담당 부서의 협조요청을 검토하고 승인합니다.
                    </p>
                  </div>
                </button>
              </div>
              <Button
                className="w-full"
                size="lg"
                disabled={!role}
                onClick={() => setStep(2)}
              >
                다음 <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
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
                <Label htmlFor="age" className="text-sm font-medium">
                  나이 <span className="text-muted-foreground">(선택)</span>
                </Label>
                <Input
                  id="age"
                  type="number"
                  min="1"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  placeholder="나이를 입력하세요"
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

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="h-4 w-4" /> 이전
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? "저장 중..." : "시작하기"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
