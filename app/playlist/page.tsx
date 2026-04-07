import type { Metadata } from "next";
import PlaylistPage from "@/components/PlaylistPage";

export const metadata: Metadata = {
  title: "Playlist",
};

export default function Page() {
  return <PlaylistPage />;
}
