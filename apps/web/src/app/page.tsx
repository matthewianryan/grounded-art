import { redirect } from "next/navigation";

// The app entry is the feed; avoid a separate stub home that needs its own client chunk.
export default function AppHome() {
  redirect("/feed");
}
