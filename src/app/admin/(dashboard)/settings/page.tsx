import SiteSettingsForm from "@/components/admin/SiteSettingsForm";
import { getSiteTitle } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const siteTitle = await getSiteTitle();
  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-black">Configurações</h1>
      <SiteSettingsForm initialTitle={siteTitle} />
    </div>
  );
}
