import SiteSettingsForm from "@/components/admin/SiteSettingsForm";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-black">Configurações</h1>
      <SiteSettingsForm initial={settings} />
    </div>
  );
}
