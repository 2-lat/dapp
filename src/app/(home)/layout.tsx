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
  props: Readonly<{ children: React.ReactNode }>,
) {
  return (
    <>
      {props.children}
    </>
  );
}
