import { twMerge } from "tailwind-merge"

const stars = [
  { cls: "orbit-s1", size: 12, opacity: 0.6 },
  { cls: "orbit-s2", size: 8, opacity: 0.4 },
  { cls: "orbit-s3", size: 6, opacity: 0.3 },
  { cls: "orbit-s4", size: 10, opacity: 0.5 },
  { cls: "orbit-s5", size: 5, opacity: 0.25 },
  { cls: "orbit-s6", size: 9, opacity: 0.45 },
  { cls: "orbit-s7", size: 7, opacity: 0.35 },
  { cls: "orbit-s8", size: 4, opacity: 0.2 },
  { cls: "orbit-s9", size: 11, opacity: 0.5 },
  { cls: "orbit-s10", size: 6, opacity: 0.3 },
  { cls: "orbit-s11", size: 8, opacity: 0.4 },
  { cls: "orbit-s12", size: 5, opacity: 0.25 },
  { cls: "orbit-s13", size: 10, opacity: 0.55 },
  { cls: "orbit-s14", size: 7, opacity: 0.35 },
  { cls: "orbit-s15", size: 4, opacity: 0.2 },
  { cls: "orbit-s16", size: 9, opacity: 0.45 },
  { cls: "orbit-s17", size: 6, opacity: 0.3 },
  { cls: "orbit-s18", size: 11, opacity: 0.5 },
  { cls: "orbit-s19", size: 5, opacity: 0.25 },
  { cls: "orbit-s20", size: 8, opacity: 0.4 },
  { cls: "orbit-s21", size: 12, opacity: 0.55 },
  { cls: "orbit-s22", size: 7, opacity: 0.3 },
  { cls: "orbit-s23", size: 9, opacity: 0.45 },
  { cls: "orbit-s24", size: 4, opacity: 0.2 },
]

export const OrbitingStars = ({ className }: { className?: string }) => (
  <div
    className={twMerge(
      "absolute inset-0 overflow-hidden rounded-2xl",
      className,
    )}
  >
    <style>{`
      @keyframes twinkle { 0%,100%{opacity:0.3} 50%{opacity:0.8} }
      .orbit-s1  { animation: o1  20s linear infinite, twinkle 3s ease-in-out infinite; }
      .orbit-s2  { animation: o2  28s linear infinite, twinkle 4s ease-in-out infinite 1s; }
      .orbit-s3  { animation: o3  35s linear infinite, twinkle 5s ease-in-out infinite 2s; }
      .orbit-s4  { animation: o4  24s linear infinite, twinkle 3.5s ease-in-out infinite .5s; }
      .orbit-s5  { animation: o5  40s linear infinite, twinkle 4.5s ease-in-out infinite 1.5s; }
      .orbit-s6  { animation: o6  22s linear infinite, twinkle 3s ease-in-out infinite .8s; }
      .orbit-s7  { animation: o7  32s linear infinite, twinkle 4.2s ease-in-out infinite 2.5s; }
      .orbit-s8  { animation: o8  38s linear infinite, twinkle 5.5s ease-in-out infinite .3s; }
      .orbit-s9  { animation: o9  18s linear infinite, twinkle 2.8s ease-in-out infinite 1.2s; }
      .orbit-s10 { animation: o10 30s linear infinite, twinkle 3.8s ease-in-out infinite 1.8s; }
      .orbit-s11 { animation: o11 26s linear infinite, twinkle 4.8s ease-in-out infinite .6s; }
      .orbit-s12 { animation: o12 36s linear infinite, twinkle 3.2s ease-in-out infinite 2.2s; }
      .orbit-s13 { animation: o13 19s linear infinite, twinkle 3.3s ease-in-out infinite .4s; }
      .orbit-s14 { animation: o14 27s linear infinite, twinkle 4.1s ease-in-out infinite 1.7s; }
      .orbit-s15 { animation: o15 34s linear infinite, twinkle 5.2s ease-in-out infinite 2.8s; }
      .orbit-s16 { animation: o16 23s linear infinite, twinkle 3.6s ease-in-out infinite .9s; }
      .orbit-s17 { animation: o17 31s linear infinite, twinkle 4.4s ease-in-out infinite 1.3s; }
      .orbit-s18 { animation: o18 37s linear infinite, twinkle 2.9s ease-in-out infinite 2.1s; }
      .orbit-s19 { animation: o19 21s linear infinite, twinkle 5.1s ease-in-out infinite .7s; }
      .orbit-s20 { animation: o20 29s linear infinite, twinkle 3.7s ease-in-out infinite 1.6s; }
      .orbit-s21 { animation: o21 17s linear infinite, twinkle 4.3s ease-in-out infinite 2.4s; }
      .orbit-s22 { animation: o22 33s linear infinite, twinkle 3.1s ease-in-out infinite .2s; }
      .orbit-s23 { animation: o23 25s linear infinite, twinkle 4.7s ease-in-out infinite 1.1s; }
      .orbit-s24 { animation: o24 39s linear infinite, twinkle 5.3s ease-in-out infinite 2.6s; }
      @keyframes o1  { 0%{transform:rotate(0deg) translateX(140px) rotate(0deg)} 100%{transform:rotate(360deg) translateX(140px) rotate(-360deg)} }
      @keyframes o2  { 0%{transform:rotate(120deg) translateX(200px) rotate(-120deg)} 100%{transform:rotate(480deg) translateX(200px) rotate(-480deg)} }
      @keyframes o3  { 0%{transform:rotate(240deg) translateX(260px) rotate(-240deg)} 100%{transform:rotate(600deg) translateX(260px) rotate(-600deg)} }
      @keyframes o4  { 0%{transform:rotate(60deg) translateX(180px) rotate(-60deg)} 100%{transform:rotate(420deg) translateX(180px) rotate(-420deg)} }
      @keyframes o5  { 0%{transform:rotate(180deg) translateX(300px) rotate(-180deg)} 100%{transform:rotate(540deg) translateX(300px) rotate(-540deg)} }
      @keyframes o6  { 0%{transform:rotate(30deg) translateX(160px) rotate(-30deg)} 100%{transform:rotate(390deg) translateX(160px) rotate(-390deg)} }
      @keyframes o7  { 0%{transform:rotate(150deg) translateX(240px) rotate(-150deg)} 100%{transform:rotate(510deg) translateX(240px) rotate(-510deg)} }
      @keyframes o8  { 0%{transform:rotate(270deg) translateX(320px) rotate(-270deg)} 100%{transform:rotate(630deg) translateX(320px) rotate(-630deg)} }
      @keyframes o9  { 0%{transform:rotate(90deg) translateX(120px) rotate(-90deg)} 100%{transform:rotate(450deg) translateX(120px) rotate(-450deg)} }
      @keyframes o10 { 0%{transform:rotate(210deg) translateX(280px) rotate(-210deg)} 100%{transform:rotate(570deg) translateX(280px) rotate(-570deg)} }
      @keyframes o11 { 0%{transform:rotate(330deg) translateX(220px) rotate(-330deg)} 100%{transform:rotate(690deg) translateX(220px) rotate(-690deg)} }
      @keyframes o12 { 0%{transform:rotate(300deg) translateX(350px) rotate(-300deg)} 100%{transform:rotate(660deg) translateX(350px) rotate(-660deg)} }
      @keyframes o13 { 0%{transform:rotate(15deg) translateX(130px) rotate(-15deg)} 100%{transform:rotate(375deg) translateX(130px) rotate(-375deg)} }
      @keyframes o14 { 0%{transform:rotate(105deg) translateX(190px) rotate(-105deg)} 100%{transform:rotate(465deg) translateX(190px) rotate(-465deg)} }
      @keyframes o15 { 0%{transform:rotate(195deg) translateX(250px) rotate(-195deg)} 100%{transform:rotate(555deg) translateX(250px) rotate(-555deg)} }
      @keyframes o16 { 0%{transform:rotate(285deg) translateX(170px) rotate(-285deg)} 100%{transform:rotate(645deg) translateX(170px) rotate(-645deg)} }
      @keyframes o17 { 0%{transform:rotate(45deg) translateX(230px) rotate(-45deg)} 100%{transform:rotate(405deg) translateX(230px) rotate(-405deg)} }
      @keyframes o18 { 0%{transform:rotate(135deg) translateX(310px) rotate(-135deg)} 100%{transform:rotate(495deg) translateX(310px) rotate(-495deg)} }
      @keyframes o19 { 0%{transform:rotate(225deg) translateX(150px) rotate(-225deg)} 100%{transform:rotate(585deg) translateX(150px) rotate(-585deg)} }
      @keyframes o20 { 0%{transform:rotate(315deg) translateX(270px) rotate(-315deg)} 100%{transform:rotate(675deg) translateX(270px) rotate(-675deg)} }
      @keyframes o21 { 0%{transform:rotate(75deg) translateX(340px) rotate(-75deg)} 100%{transform:rotate(435deg) translateX(340px) rotate(-435deg)} }
      @keyframes o22 { 0%{transform:rotate(165deg) translateX(155px) rotate(-165deg)} 100%{transform:rotate(525deg) translateX(155px) rotate(-525deg)} }
      @keyframes o23 { 0%{transform:rotate(255deg) translateX(210px) rotate(-255deg)} 100%{transform:rotate(615deg) translateX(210px) rotate(-615deg)} }
      @keyframes o24 { 0%{transform:rotate(345deg) translateX(290px) rotate(-345deg)} 100%{transform:rotate(705deg) translateX(290px) rotate(-705deg)} }
    `}</style>

    {/* Orbit center - right side */}
    <div className="absolute top-1/2 right-[15%]">
      {stars.map((s) => (
        <div key={s.cls} className={`${s.cls} absolute`}>
          <svg
            width={s.size}
            height={s.size}
            viewBox="0 0 16 16"
            fill="white"
            fillOpacity={s.opacity}
          >
            <path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z" />
          </svg>
        </div>
      ))}
    </div>

    {/* Second orbit center - left side */}
    <div className="absolute top-1/3 left-[10%]">
      {stars.slice(0, 10).map((s, i) => (
        <div key={`l-${s.cls}`} className={`orbit-s${i + 13} absolute`}>
          <svg
            width={s.size - 2}
            height={s.size - 2}
            viewBox="0 0 16 16"
            fill="white"
            fillOpacity={s.opacity * 0.6}
          >
            <path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z" />
          </svg>
        </div>
      ))}
    </div>

    {/* Third orbit center - bottom */}
    <div className="absolute bottom-[20%] right-[40%]">
      {stars.slice(4, 14).map((s, i) => (
        <div key={`b-${s.cls}`} className={`orbit-s${i + 15} absolute`}>
          <svg
            width={s.size - 1}
            height={s.size - 1}
            viewBox="0 0 16 16"
            fill="white"
            fillOpacity={s.opacity * 0.5}
          >
            <path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z" />
          </svg>
        </div>
      ))}
    </div>
  </div>
)
