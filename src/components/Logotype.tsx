import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import Link from "next/link";

export const Logotype = ({ isVisible = true }: { isVisible?: boolean }) => {
  return (
    <motion.div
      className={cn(
        "text-foreground",
        "fixed",
        "top-0",
        "z-[20]",
        "mx-auto",
        "flex",
        "w-full",
        "flex-row",
        "items-center",
        "justify-center",
        "py-4",
      )}
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={isVisible ? "visible" : "hidden"}
    >
      <Link href="/" className="group">
        <div className="text-3xl">
          <span className="relative">
            o
            <span className="absolute left-1/2 -translate-x-1/2 translate-y-[0.04em] pr-[0.12em] transition-transform duration-200 group-hover:translate-y-[-0.04em]">
              |
            </span>
            <span className="absolute left-1/2 -translate-x-1/2 translate-y-[0.04em] pl-[0.12em] transition-transform duration-200 group-hover:translate-y-[0.12em]">
              |
            </span>
          </span>
        </div>
      </Link>
    </motion.div>
  );
};
