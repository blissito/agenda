import { CommunityPage } from "~/components/Community/CommunityPage"
import { Footer } from "~/components/common/Footer"
import { TopBar } from "~/components/common/topBar"

export default function Community() {
  return (
    <main className="bg-brand_dark min-h-screen">
      <div className="bg-white rounded-b-[40px] min-h-screen">
        <TopBar />
        <CommunityPage />
      </div>
      <Footer />
    </main>
  )
}
