import { cn } from "@/lib/utils";

export const ProseContent = ({
  children,
  className,
  classNames,
}: {
  children: React.ReactNode;
  className?: string;
  classNames?: { prose?: string; container?: string };
}) => {
  return (
    <div
      className={cn(
        "@container mx-auto max-w-3xl p-2 md:p-4",
        className,
        classNames?.container,
      )}
    >
      <div
        className={cn(
          "prose @sm:prose-sm @md:prose-base @lg:prose-lg dark:prose-invert @lg:max-w-full",
          classNames?.prose,
        )}
      >
        {children}
      </div>
    </div>
  );
};
