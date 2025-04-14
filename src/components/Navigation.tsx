import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import Link from "next/link";

export const Navigation = ({ isVisible = true }: { isVisible?: boolean }) => {
  return (
    <motion.nav
      className={cn(
        "[&>a]:text-muted-foreground",
        "[&>a]:hover:text-foreground",
        "fixed",
        "bottom-0",
        "z-[20]",
        "flex",
        "w-full",
        "items-center",
        "justify-center",
        "gap-x-12",
        "py-4",
        "transition-opacity",
        "duration-500",
        "[&>a]:p-4",
      )}
      variants={{
        visible: { y: 0 },
        hidden: { y: "100%" },
      }}
      animate={isVisible ? "visible" : "hidden"}
    >
      <Link href="/manifesto" passHref>
        manifesto
      </Link>
      <Link href="/whitepaper" passHref>
        whitepaper
      </Link>
      <Link href="/observe" passHref>
        observe
      </Link>
    </motion.nav>
  );
};
