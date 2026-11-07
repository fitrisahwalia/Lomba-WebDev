import { redirect } from "next/navigation";

export default function Home() {
  // Arahkan pengunjung awal ke Landing Page (home)
  redirect("/home");
}