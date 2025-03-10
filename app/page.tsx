import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/home"); // ✅ Redirects to `/home` automatically
}
