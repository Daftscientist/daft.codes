import type { Metadata } from "next";
import TerminalPage from "@/components/TerminalPage";

export const metadata: Metadata = {
  title: "Terminal",
};

export default function Page() {
  return <TerminalPage />;
}
