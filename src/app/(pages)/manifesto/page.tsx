import { ManifestContent } from "@/app/_components/ManifestContent";

export default function Manifesto() {
  return (
    <div className="@container mx-auto max-w-3xl p-2 md:p-4">
      <div className="prose @sm:prose-sm @md:prose-base @lg:prose-lg @xl:prose-xl @xl:max-w-full dark:prose-invert text-center">
        <h1 className="text-center">Manifesto</h1>
        <ManifestContent />
      </div>
    </div>
  );
}
