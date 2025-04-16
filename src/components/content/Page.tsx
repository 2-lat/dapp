"use client";

import { useMounted } from "@/hooks/useMounted";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState, type ComponentProps } from "react";

const PageInner = ({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "not-sticky" | "default";
}) => {
  const pageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: scrollY } = useScroll({
    target: pageRef,
    offset: ["start 50%", "end end"],
  });

  const notSticky = variant === "not-sticky";

  const offset = useTransform(scrollY, (y) => {
    if (!pageRef.current || !contentRef.current) {
      return 1;
    }

    if (variant === "not-sticky") {
      return 1;
    }
    // console.log(window.innerHeight * 0.5, contentRef.current.clientHeight);
    // if (window.innerHeight * 0.5 < contentRef.current.clientHeight) {
    //   return 0;
    // }
    const elapsed = Math.max(1, y * pageRef.current.clientHeight * 0.5);
    return -Math.min(elapsed, contentRef.current.clientHeight * 0.5);
    // const contentRef.current ? Math.min(contentRef.current.clientHeight / 2, y) : 0)
  });

  const margin = useTransform(offset, (o) => -o);

  return (
    <motion.div
      className="relative min-h-screen"
      ref={pageRef}
      style={{
        y: offset,
        marginBottom: offset,
        paddingTop: margin,
      }}
    >
      <div className={cn(!notSticky && "sticky top-1/2")} ref={contentRef}>
        {children}
      </div>
    </motion.div>
  );
};

export const Page = ({
  children,
  ...props
}: ComponentProps<typeof PageInner>) => {
  const mounted = useMounted();
  const notSticky = props.variant === "not-sticky";

  return mounted ? (
    <PageInner {...props}>{children}</PageInner>
  ) : (
    <div className="relative min-h-screen margin-0 padding-0">
      <div className={cn(!notSticky && "sticky top-1/2")}>{children}</div>
    </div>
  );
};
