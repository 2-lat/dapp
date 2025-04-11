import { ManifestContent } from "@/app/_components/ManifestContent";
import { Modal } from "../modal";

export default function ManifestoModal() {
  return (
    <Modal title="Manifesto">
      <div className="prose prose-sm dark:prose-invert">
        <ManifestContent />
      </div>
    </Modal>
  );
}
