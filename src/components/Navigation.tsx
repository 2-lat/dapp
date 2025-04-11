import Link from "next/link";

export const Navigation = ({ isVisible = true }: { isVisible?: boolean }) => {
  return (
    <>
      <div className="text-foreground fixed top-0 z-[20] mx-auto flex w-full flex-row items-center justify-center py-4">
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
      </div>

      <nav 
        className={`[&>a]:text-muted-foreground [&>a]:hover:text-foreground fixed bottom-0 z-[20] flex w-full items-center justify-center gap-x-12 py-4 [&>a]:p-4 transition-opacity duration-500 ${
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
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
      </nav>
    </>
  );
}; 