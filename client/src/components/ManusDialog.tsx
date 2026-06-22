import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

interface ManusDialogProps {
  title?: string;
  logo?: string;
  open?: boolean;
  onLogin: () => void;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
}

export function ManusDialog({
  title,
  logo,
  open = false,
  onLogin,
  onOpenChange,
  onClose,
}: ManusDialogProps) {
  const [internalOpen, setInternalOpen] = useState(open);

  useEffect(() => {
    if (!onOpenChange) {
      setInternalOpen(open);
    }
  }, [open, onOpenChange]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(nextOpen);
    } else {
      setInternalOpen(nextOpen);
    }

    if (!nextOpen) {
      onClose?.();
    }
  };

  return (
    <Dialog
      open={onOpenChange ? open : internalOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="py-5 bg-[#f8f8f7] rounded-[20px] w-[400px] shadow-[0px_4px_11px_0px_rgba(0,0,0,0.08)] border border-[rgba(0,0,0,0.08)] backdrop-blur-2xl gap-0" style={{padding: 0, textAlign: "center"}}>
        <div className="p-5 pt-12" style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem"}}>
          {logo ? (
            <div className="w-16 h-16 border border-[rgba(0,0,0,0.08)]" style={{backgroundColor: "white", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center"}}>
              <img
                src={logo}
                alt="Dialog graphic"
                className="w-10 h-10" style={{borderRadius: "0.375rem"}}
              />
            </div>
          ) : null}

          {/* Title and subtitle */}
          {title ? (
            <DialogTitle className="text-[#34322d] leading-[26px] tracking-[-0.44px]" style={{fontSize: "1.25rem", fontWeight: 600}}>
              {title}
            </DialogTitle>
          ) : null}
          <DialogDescription className="text-[#858481] leading-5 tracking-[-0.154px]" style={{fontSize: "0.875rem"}}>
            Please login with Manus to continue
          </DialogDescription>
        </div>

        <DialogFooter className="px-5 py-5">
          {/* Login button */}
          <Button
            onClick={onLogin}
            className="h-10 bg-[#1a1a19] hover:bg-[#1a1a19]/90 text-white rounded-[10px] leading-5 tracking-[-0.154px]" style={{width: "100%", fontSize: "0.875rem", fontWeight: 500}}
          >
            Login with Manus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
