import { redirect } from "next/navigation";

export default function TransportPage() {
  // Mengarahkan otomatis siapapun yang mengakses /transport ke admin_transport
  redirect("/transport/admin_transport");
}