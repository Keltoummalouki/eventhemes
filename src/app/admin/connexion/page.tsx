import { redirect } from "next/navigation";
import { AdminLogin } from "@/components/eventheme/Admin";
import { adminRedirectPath } from "@/lib/eventheme/auth";
import { authConfigured, isAdmin } from "@/lib/eventheme/server";
export const metadata = {
  title: "Connexion administrateur",
  robots: { index: false, follow: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const next = adminRedirectPath((await searchParams).next);
  if (await isAdmin()) redirect(next);
  return <AdminLogin configured={authConfigured()} next={next} />;
}
