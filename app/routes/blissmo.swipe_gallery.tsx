import { SwipeGallery } from "~/components/animated/SwipeGallery";

export default function Route() {
  return (
    <main className="bg-gray-200 h-screen flex justify-center items-center overflow-hidden">
      <SwipeGallery>
        <img
          className="min-h-full object-cover w-full pointer-events-none"
          src="https://i.imgur.com/J3n6WO2.png"
          alt="illustratio"
        />
        <img
          className="min-h-full object-cover w-full pointer-events-none"
          src="https://i.imgur.com/GAS5XVz.png"
          alt="illustratioN"
        />
        <img
          className="min-h-full object-cover w-full pointer-events-none"
          src="https://i.imgur.com/FNJAQqX.png"
          alt="illustration"
        />
      </SwipeGallery>
    </main>
  );
}
