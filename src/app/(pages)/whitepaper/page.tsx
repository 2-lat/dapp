import { WhitepaperContent } from "@/app/_components/WhitepaperContent";
import { ProseContent } from "@/components/content/ProseContent";

export default function Whitepaper() {
  return (
    <ProseContent>
      <h1>The Second Latitude</h1>
      <WhitepaperContent className="@sm:prose-sm @md:prose-base @lg:prose-lg @xl:prose-xl" />
    </ProseContent>
  );
}
