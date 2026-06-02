import { useEffect } from "react"
import { CommunityPage } from "~/components/Community/CommunityPage"
import { Footer } from "~/components/common/Footer"
import { TopBar } from "~/components/common/topBar"

export default function Community() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
  }, [])

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
