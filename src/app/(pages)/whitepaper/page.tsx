import { WhitepaperContent } from "@/app/_components/WhitepaperContent";

export default function Whitepaper() {
  return (
    <div className="@container mx-auto max-w-3xl p-2 md:p-4">
      <div className="prose @sm:prose-sm @md:prose-base @lg:prose-lg @xl:prose-xl @xl:max-w-full dark:prose-invert">
        <h1>The Second Latitude</h1>
        <WhitepaperContent className="@sm:prose-sm @md:prose-base @lg:prose-lg @xl:prose-xl" />
      </div>
    </div>
  );
}
