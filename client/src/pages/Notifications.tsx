import AppNav from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Bell, BellOff, Check, CheckCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function typeIcon(type: string) {
  switch (type) {
    case "approved":
      return "✅";
    case "partial":
      return "🟦";
    case "rejected":
      return "⛔";
    default:
      return "🔔";
  }
}

export default function Notifications() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const { data: notifications, isLoading } = trpc.notifications.list.useQuery();
  const markRead = trpc.notifications.markRead.useMutation({
    onSuccess: () => utils.notifications.list.invalidate(),
  });
  const markAllRead = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => utils.notifications.list.invalidate(),
  });

  const unreadCount = (notifications ?? []).filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <div className="container max-w-3xl py-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">
              알림
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {unreadCount > 0
                ? `읽지 않은 알림 ${unreadCount}개`
                : "모든 알림을 확인했습니다."}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllRead.mutate()}
            >
              <CheckCheck className="h-4 w-4" /> 모두 읽음
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (notifications ?? []).length === 0 ? (
          <div className="card-elegant flex flex-col items-center py-16 text-center">
            <BellOff className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">아직 알림이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(notifications ?? []).map(n => (
              <div
                key={n.id}
                className={cn(
                  "card-elegant flex items-start gap-3 !p-4 transition-colors",
                  !n.isRead && "border-primary/30 bg-primary/5"
                )}
              >
                <span className="text-xl leading-none">{typeIcon(n.type)}</span>
                <button
                  onClick={() => {
                    if (!n.isRead) markRead.mutate({ id: n.id });
                    setLocation(`/request/${n.requestId}`);
                  }}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="text-sm leading-snug text-foreground">
                    {n.message}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(n.createdAt).toLocaleString("ko-KR")}
                  </p>
                </button>
                {!n.isRead ? (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => markRead.mutate({ id: n.id })}
                    aria-label="읽음 처리"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                ) : (
                  <Bell className="h-4 w-4 text-muted-foreground/40" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
