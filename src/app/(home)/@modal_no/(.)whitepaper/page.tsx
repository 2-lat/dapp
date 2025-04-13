import { WhitepaperContent } from "@/app/_components/WhitepaperContent";
import { Modal } from "../modal";
import { DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function WhitepaperModal() {
  return (
    <Modal
      title="Whitepaper"
      description={
        <span className="flex w-full flex-row items-center justify-between">
          <Button variant="outline" size="sm" asChild>
            <Link href="/whitepaper.pdf" target="_blank">
              <DownloadIcon /> Download
            </Link>
          </Button>
        </span>
      }
    >
      <div className="prose prose-sm dark:prose-invert">
        <WhitepaperContent />
      </div>
    </Modal>
  );
}
