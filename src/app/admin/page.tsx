import Admin from "@/components/eventheme/Admin";
import {
  getEntries,
  getInquiries,
  localMode,
  verifyAdmin,
} from "@/lib/eventheme/server";
export const metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};
export default async function Page() {
  await verifyAdmin();
  return (
    <Admin
      initialEntries={await getEntries(true)}
      initialInquiries={await getInquiries()}
      local={localMode()}
    />
  );
}
