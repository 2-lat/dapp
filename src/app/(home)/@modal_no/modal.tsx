"use client";

import { type ElementRef, type ReactNode, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function Modal({ children, title, description }: { children: React.ReactNode, title?: ReactNode, description?: ReactNode }) {
  const router = useRouter();

  return (
    <Dialog open={true} onOpenChange={() => router.back()}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
          <DialogClose />
          <div className="max-h-[calc(100vh-10rem)] overflow-y-auto">
            {children}
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
