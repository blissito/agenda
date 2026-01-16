import { TrialBanner } from "~/components/banner/TrialBanner";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function TrialBannerPreview() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);

  return (
    <div className="min-h-screen bg-neutral-100 p-10">
      <h1 className="text-xl font-semibold mb-4">
        Preview · Trial Banner
      </h1>

      <div className="flex gap-3 mb-6">
        <button
          className="px-4 py-2 rounded bg-neutral-200"
          onClick={() => setVisible(true)}
        >
          Mostrar banner
        </button>
      </div>

      {visible && (
        <TrialBanner
          status="expired"
          imageSrc="/images/trial-ended.png"
          onPrimaryAction={() => navigate("/billing")}
          onDismiss={() => setVisible(false)}
        />
      )}
    </div>
  );
}
