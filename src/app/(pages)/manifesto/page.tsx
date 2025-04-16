import { ManifestContent } from "@/app/_components/ManifestContent";
import { ProseContent } from "@/components/content/ProseContent";

export default function Manifesto() {
  return (
    <ProseContent classNames={{ prose: "text-center" }}>
      <h1 className="text-center">Manifesto</h1>
      <ManifestContent />
    </ProseContent>
  );
}
