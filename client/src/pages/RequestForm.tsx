import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";

type RequestType = "space" | "item";

export default function RequestForm() {
  const [, setLocation] = useLocation();
  const [requestType, setRequestType] = useState<RequestType | null>(null);
  const [formData, setFormData] = useState({
    roomId: "",
    itemId: "",
    itemQuantity: "",
    requestDate: "",
    startTime: "",
    endTime: "",
    purpose: "",
    attendeeCount: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const { data: rooms } = trpc.rooms.list.useQuery();
  const { data: items } = trpc.items.list.useQuery();
  const createRequestMutation = trpc.requests.create.useMutation();

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!requestType || !formData.requestDate || !formData.startTime || !formData.endTime) {
      toast.error("필수 항목을 모두 입력해주세요.");
      return;
    }

    if (requestType === "space" && !formData.roomId) {
      toast.error("장소를 선택해주세요.");
      return;
    }

    if (requestType === "item" && !formData.itemId) {
      toast.error("물품을 선택해주세요.");
      return;
    }

    try {
      await createRequestMutation.mutateAsync({
        type: requestType,
        roomId: requestType === "space" ? parseInt(formData.roomId) : undefined,
        itemId: requestType === "item" ? parseInt(formData.itemId) : undefined,
        itemQuantity: formData.itemQuantity ? parseInt(formData.itemQuantity) : undefined,
        requestDate: formData.requestDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        purpose: formData.purpose,
        attendeeCount: formData.attendeeCount ? parseInt(formData.attendeeCount) : undefined,
      });
      setSubmitted(true);
    } catch (error: any) {
      toast.error(error.message || "요청 생성에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 네비게이션 */}
      <nav className="border-b border-slate-200 bg-white shadow-sm">
        <div className="container flex items-center gap-4 py-4">
          <button onClick={() => setLocation("/dashboard")} className="text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="text-2xl font-bold text-accent">ChurchLink</div>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          {/* 완료 화면 */}
          {submitted ? (
            <div className="card-elegant text-center py-12">
              <div className="mb-4 inline-block rounded-lg bg-green-100 p-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-slate-900">요청이 접수되었습니다!</h2>
              <p className="mb-6 text-slate-600">
                담당 목사님이 곧 검토하실 것입니다.
                <br />
                알림을 통해 처리 결과를 받아보세요.
              </p>
              <Button onClick={() => setLocation("/dashboard")}>
                대시보드로 돌아가기
              </Button>
            </div>
          ) : !requestType ? (
            // Step 1: 요청 종류 선택
            <div>
              <h1 className="mb-2 text-3xl font-bold text-slate-900">협조요청 신청</h1>
              <p className="mb-8 text-slate-600">요청 종류를 선택해주세요</p>

              <div className="grid gap-4 md:grid-cols-2">
                <button
                  onClick={() => setRequestType("space")}
                  className="card-elegant border-2 border-transparent transition-all hover:border-accent"
                >
                  <h3 className="mb-2 text-lg font-semibold text-slate-900">장소 대여</h3>
                  <p className="text-sm text-slate-600">
                    뮤직홀, 오픈홀 등 교회 장소를 대여합니다
                  </p>
                </button>
                <button
                  onClick={() => setRequestType("item")}
                  className="card-elegant border-2 border-transparent transition-all hover:border-accent"
                >
                  <h3 className="mb-2 text-lg font-semibold text-slate-900">물품 대여</h3>
                  <p className="text-sm text-slate-600">
                    교회 물품을 대여합니다
                  </p>
                </button>
              </div>
            </div>
          ) : (
            // Step 2: 상세 정보 입력
            <div>
              <div className="mb-6 flex items-center gap-2">
                <button
                  onClick={() => setRequestType(null)}
                  className="text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="text-3xl font-bold text-slate-900">
                  {requestType === "space" ? "장소 대여" : "물품 대여"} 신청
                </h1>
              </div>

              <div className="card-elegant space-y-6">
                {/* 장소 또는 물품 선택 */}
                <div>
                  <Label htmlFor="selection" className="text-sm font-medium">
                    {requestType === "space" ? "장소 선택" : "물품 선택"}
                  </Label>
                  <Select
                    value={requestType === "space" ? formData.roomId : formData.itemId}
                    onValueChange={(value) =>
                      handleSelectChange(requestType === "space" ? "roomId" : "itemId", value)
                    }
                  >
                    <SelectTrigger className="input-elegant mt-1">
                      <SelectValue
                        placeholder={requestType === "space" ? "장소를 선택하세요" : "물품을 선택하세요"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {(requestType === "space" ? rooms : items)?.map((item: any) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 날짜 선택 */}
                <div>
                  <Label htmlFor="requestDate" className="text-sm font-medium">
                    요청 날짜
                  </Label>
                  <Input
                    id="requestDate"
                    name="requestDate"
                    type="date"
                    value={formData.requestDate}
                    onChange={handleFormChange}
                    className="input-elegant mt-1"
                  />
                </div>

                {/* 시간 선택 */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="startTime" className="text-sm font-medium">
                      시작 시간
                    </Label>
                    <Input
                      id="startTime"
                      name="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={handleFormChange}
                      className="input-elegant mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime" className="text-sm font-medium">
                      종료 시간
                    </Label>
                    <Input
                      id="endTime"
                      name="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={handleFormChange}
                      className="input-elegant mt-1"
                    />
                  </div>
                </div>

                {/* 물품 수량 (물품 대여인 경우) */}
                {requestType === "item" && (
                  <div>
                    <Label htmlFor="itemQuantity" className="text-sm font-medium">
                      수량
                    </Label>
                    <Input
                      id="itemQuantity"
                      name="itemQuantity"
                      type="number"
                      min="1"
                      value={formData.itemQuantity}
                      onChange={handleFormChange}
                      className="input-elegant mt-1"
                    />
                  </div>
                )}

                {/* 참석 인원 */}
                <div>
                  <Label htmlFor="attendeeCount" className="text-sm font-medium">
                    참석 인원 (선택)
                  </Label>
                  <Input
                    id="attendeeCount"
                    name="attendeeCount"
                    type="number"
                    min="1"
                    value={formData.attendeeCount}
                    onChange={handleFormChange}
                    className="input-elegant mt-1"
                  />
                </div>

                {/* 사용 목적 */}
                <div>
                  <Label htmlFor="purpose" className="text-sm font-medium">
                    사용 목적 (선택)
                  </Label>
                  <Textarea
                    id="purpose"
                    name="purpose"
                    placeholder="사용 목적을 입력해주세요"
                    value={formData.purpose}
                    onChange={handleFormChange}
                    className="input-elegant mt-1"
                    rows={3}
                  />
                </div>

                {/* 버튼 */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setRequestType(null)}
                  >
                    이전
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSubmit}
                    disabled={createRequestMutation.isPending}
                  >
                    {createRequestMutation.isPending ? "처리 중..." : "신청하기"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
