import { useParams } from "react-router";
import { TopBar } from "~/components/common/topBar";

export default function CommunityBusinessProfile() {
  const { slug } = useParams();

  return (
    <main className="bg-brand_dark min-h-screen">
      <div className="bg-white rounded-b-[40px] min-h-screen">
        <TopBar />

        <section className="pt-28 px-6 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-brand_dark">Perfil del negocio</h1>
          <p className="mt-3 text-brand_gray">Slug: {slug}</p>
        </section>
      </div>
    </main>
  );
}
