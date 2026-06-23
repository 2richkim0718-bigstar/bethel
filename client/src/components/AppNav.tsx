import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import {
  Bell,
  Church,
  LayoutDashboard,
  LogOut,
  Plus,
  ClipboardCheck,
  Check,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function timeAgo(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "방금 전";
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}일 전`;
  return d.toLocaleDateString("ko-KR");
}

/** 모든 로그인 화면 상단에 쓰는 공용 네비게이션 (브랜드 + 역할별 링크 + 알림 벨 + 사용자 메뉴). */
export default function AppNav() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const isPastor = user?.role === "admin";
  const homePath = isPastor ? "/admin/requests" : "/dashboard";

  const { data: notifications } = trpc.notifications.list.useQuery(undefined, {
    enabled: !!user,
    refetchInterval: 30000,
  });
  const markRead = trpc.notifications.markRead.useMutation({
    onSuccess: () => utils.notifications.list.invalidate(),
  });
  const markAllRead = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => utils.notifications.list.invalidate(),
  });

  const unread = (notifications ?? []).filter(n => !n.isRead);

  const navLink = (path: string, label: string, Icon: typeof Plus) => {
    const active = location === path;
    return (
      <Link href={path}>
        <span
          className={cn(
            "inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            active
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </span>
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-border/70 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/70">
      <div className="container flex h-16 items-center justify-between gap-3">
        {/* 브랜드 */}
        <Link href={homePath}>
          <span className="flex cursor-pointer items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Church className="h-5 w-5" />
            </span>
            <span className="font-serif text-xl font-bold tracking-tight text-foreground">
              ChurchLink
            </span>
          </span>
        </Link>

        {/* 가운데 네비게이션 (데스크톱) */}
        <div className="hidden items-center gap-1 md:flex">
          {isPastor ? (
            navLink("/admin/requests", "요청 관리", ClipboardCheck)
          ) : (
            <>
              {navLink("/dashboard", "대시보드", LayoutDashboard)}
              {navLink("/request/new", "새 요청", Plus)}
            </>
          )}
        </div>

        {/* 우측: 알림 + 사용자 */}
        <div className="flex items-center gap-1.5">
          {/* 알림 벨 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                aria-label="알림"
              >
                <Bell className="h-5 w-5" />
                {unread.length > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                    {unread.length > 9 ? "9+" : unread.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-2 py-1.5">
                <DropdownMenuLabel className="p-0">알림</DropdownMenuLabel>
                {unread.length > 0 && (
                  <button
                    onClick={() => markAllRead.mutate()}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    모두 읽음
                  </button>
                )}
              </div>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                {(notifications ?? []).length === 0 ? (
                  <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                    알림이 없습니다.
                  </p>
                ) : (
                  (notifications ?? []).slice(0, 8).map(n => (
                    <button
                      key={n.id}
                      onClick={() => {
                        if (!n.isRead) markRead.mutate({ id: n.id });
                        setLocation(`/request/${n.requestId}`);
                      }}
                      className={cn(
                        "flex w-full items-start gap-2 px-3 py-2.5 text-left transition-colors hover:bg-accent",
                        !n.isRead && "bg-primary/5"
                      )}
                    >
                      {!n.isRead ? (
                        <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                      ) : (
                        <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                      )}
                      <span className="min-w-0">
                        <span className="block text-sm leading-snug text-foreground">
                          {n.message}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {timeAgo(n.createdAt)}
                        </span>
                      </span>
                    </button>
                  ))
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLocation("/notifications")}>
                전체 알림 보기
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 사용자 메뉴 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                  {(user?.name ?? "?").slice(0, 1)}
                </span>
                <span className="hidden max-w-28 truncate sm:inline">
                  {user?.name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="truncate">{user?.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {isPastor ? "목사님" : "성도"}
                    {user?.department ? ` · ${user.department}` : ""}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLocation(homePath)}>
                <LayoutDashboard className="h-4 w-4" />
                {isPastor ? "요청 관리" : "대시보드"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation("/notifications")}>
                <Bell className="h-4 w-4" />
                알림
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} variant="destructive">
                <LogOut className="h-4 w-4" />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
