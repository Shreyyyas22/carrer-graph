import PageShell from "@/components/layout/PageShell";
import ProfileContent from "@/components/profile/ProfileContent";

const DEVELOPER_ID = process.env.NEXT_PUBLIC_DEFAULT_DEVELOPER_ID || "";

export default function ProfilePage() {
  return (
    <PageShell
      title="Your profile"
      description="Info, role and skills from the graph. Set NEXT_PUBLIC_DEFAULT_DEVELOPER_ID in frontend/.env.local."
    >
      <ProfileContent developerId={DEVELOPER_ID} />
    </PageShell>
  );
}
