import PageShell from "@/components/layout/PageShell";
import ProfileContent from "@/components/profile/ProfileContent";

const DEVELOPER_ID = process.env.NEXT_PUBLIC_DEFAULT_DEVELOPER_ID || "";

export default function ProfilePage() {
  return (
    <PageShell
      title="Your profile"
      description="Your role, location and skills from the graph."
    >
      <ProfileContent developerId={DEVELOPER_ID} />
    </PageShell>
  );
}
