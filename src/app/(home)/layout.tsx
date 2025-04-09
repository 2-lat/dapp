import { ToggleTheme } from "@/components/toggle-theme";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Dialog } from "@/components/ui/dialog";

export default function HomeLayout(
  props: Readonly<{ children: React.ReactNode; modal: React.ReactNode }>,
) {
  return (
    <main className="relative min-h-screen">
      <ToggleTheme className="fixed top-4 right-4 z-20" />
      {props.children}
      {props.modal}
      <div id="modal-root" />
    </main>
  );
}
