import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useLocation } from "wouter";
import { UserPlus, ArrowRight } from "lucide-react";
import { getLoginUrl } from "@/const";

type Step = "role" | "info" | "complete";

export default function Signup() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<"pastor" | "member" | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    department: "",
  });

  const departments = [
    "유치부",
    "고등2부",
    "중등2부",
    "1청년부",
    "2청년부",
    "3청년부",
  ];

  const handleRoleSelect = (selectedRole: "pastor" | "member") => {
    setRole(selectedRole);
    setStep("info");
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDepartmentChange = (value: string) => {
    setFormData(prev => ({ ...prev, department: value }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.age || !formData.department) {
      alert("모든 항목을 입력해주세요.");
      return;
    }
    setStep("complete");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md">
        {/* 카드 */}
        <div className="card-elegant">
          {/* 로고 */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-block rounded-lg bg-accent/10 p-3">
              <UserPlus className="h-6 w-6 text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">ChurchLink</h1>
            <p className="mt-2 text-sm text-slate-600">회원가입</p>
          </div>

          {/* Step 1: 역할 선택 */}
          {step === "role" && (
            <div className="space-y-4">
              <p className="text-center text-sm font-medium text-slate-900">
                당신의 역할을 선택해주세요
              </p>
              <div className="grid gap-3">
                <button
                  onClick={() => handleRoleSelect("pastor")}
                  className="card-elegant border-2 border-transparent transition-all hover:border-accent"
                >
                  <h3 className="font-semibold text-slate-900">목사님</h3>
                  <p className="text-sm text-slate-600">
                    협조요청을 승인하고 관리합니다
                  </p>
                </button>
                <button
                  onClick={() => handleRoleSelect("member")}
                  className="card-elegant border-2 border-transparent transition-all hover:border-accent"
                >
                  <h3 className="font-semibold text-slate-900">성도</h3>
                  <p className="text-sm text-slate-600">
                    장소와 물품 대여를 신청합니다
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: 정보 입력 */}
          {step === "info" && role && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  이름
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="이름을 입력하세요"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="input-elegant mt-1"
                />
              </div>

              <div>
                <Label htmlFor="age" className="text-sm font-medium">
                  나이
                </Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  placeholder="나이를 입력하세요"
                  value={formData.age}
                  onChange={handleFormChange}
                  className="input-elegant mt-1"
                />
              </div>

              <div>
                <Label htmlFor="department" className="text-sm font-medium">
                  소속 부서
                </Label>
                <Select value={formData.department} onValueChange={handleDepartmentChange}>
                  <SelectTrigger className="input-elegant mt-1">
                    <SelectValue placeholder="부서를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("role")}
                >
                  이전
                </Button>
                <Button className="flex-1" onClick={handleSubmit}>
                  다음
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: 완료 */}
          {step === "complete" && (
            <div className="text-center">
              <div className="mb-4 inline-block rounded-lg bg-green-100 p-3">
                <ArrowRight className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="mb-2 text-lg font-semibold text-slate-900">
                가입이 완료되었습니다!
              </h2>
              <p className="mb-6 text-sm text-slate-600">
                이제 로그인하여 서비스를 시작할 수 있습니다.
              </p>
              <a href={getLoginUrl()}>
                <Button className="w-full">로그인하기</Button>
              </a>
            </div>
          )}
        </div>

        {/* 하단 링크 */}
        {step === "role" && (
          <p className="mt-6 text-center text-sm text-slate-600">
            이미 계정이 있으신가요?{" "}
            <Link href="/login">
              <a className="font-medium text-accent hover:underline">로그인</a>
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
