import { TopBar } from "~/components/common/topBar";
import { CommunityPage } from "~/components/Community/CommunityPage";

export default function Community() {
  return (
    <main className="bg-brand_dark min-h-screen">
      <div className="bg-white rounded-b-[40px] min-h-screen">
        <TopBar />
        <CommunityPage />
      </div>
    </main>
  );
}
