import { Form } from "react-router";
import { type FieldValues, useForm } from "react-hook-form";
import { REQUIRED_MESSAGE } from "~/routes/login/signup.$stepSlug";
import { PrimaryButton } from "../common/primaryButton";
import { twMerge } from "tailwind-merge";
import { useFetcher, useSearchParams } from "react-router";
import { type Org } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "~/components/icons/arrowRight";
import { AnimatePresence, motion } from "motion/react";

const OPTIONS = ["Solo yo", "2", "3 a 5", "6 a 14", "15 o más"];

export const AboutYourCompanyForm = ({
  org,
  stepSlug,
}: {
  org: Org | null;
  stepSlug?: string;
}) => {
  const fetcher = useFetcher();

  const [searchParams, setSearchParams] = useSearchParams();

  const initialScreen = useMemo<0 | 1 | 2>(() => {
    const s = searchParams.get("screen");
    if (s === "2") return 2;
    if (s === "1") return 1;
    return 0;
  }, [searchParams]);

  const [screen, setScreen] = useState<0 | 1 | 2>(initialScreen);

  const setScreenAndUrl = (next: 0 | 1 | 2) => {
    setScreen(next);

    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        p.set("screen", String(next));
        return p;
      },
      { replace: true } as any
    );
  };

  const {
    handleSubmit,
    register,
    setValue,
    trigger,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: { ...org },
  });

  const shopKeeperLive =
    watch("shopKeeper") || org?.shopKeeper || "Luisita Sanchez";

  const onSubmit = (values: FieldValues) => {
    fetcher.submit(
      { intent: "update_org", data: JSON.stringify(values), next: "/signup/4" },
      { method: "post" }
    );
  };

  useEffect(() => {
    setValue("numberOfEmployees", "Solo yo", { shouldValidate: true });
  }, []);

  const goNext = async () => {
    if (screen === 0) {
      const ok = await trigger("name");
      if (ok) setScreenAndUrl(1);
      return;
    }
    if (screen === 1) {
      const ok = await trigger("shopKeeper");
      if (ok) setScreenAndUrl(2);
      return;
    }
  };

  const onEnterNext = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    await goNext();
  };

  return (
    <>
      <Form
        method="post"
        onSubmit={handleSubmit(onSubmit)}
        className={twMerge(
          "relative w-full",
          "min-h-[calc(100vh-170px)]",
          "flex items-center"
        )}
      >
        {screen === 0 ? <FloatingEmojisStep1 /> : null}
        {screen === 1 ? <FloatingEmojisStep2 /> : null}

        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, y: 18, scale: 0.99, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -14, scale: 0.985, filter: "blur(8px)" }}
            transition={{ type: "spring", bounce: 0.25, duration: 0.55 }}
            className="w-full"
          >
            {/* ===== Screen 1: Nombre negocio ===== */}
            {screen === 0 && (
              <div className="relative z-10 mx-auto w-full max-w-6xl text-center">
                <div className="mx-auto mb-8 flex w-full justify-center">
                  <img
                    src="/images/signin/Screen.svg"
                    alt="preview"
                    className="h-[110px] w-auto select-none pointer-events-none"
                    draggable={false}
                  />
                </div>

                <p className="font-jakarta text-[24px] font-bold text-brand_dark">
                  Empecemos con el nombre de tu negocio
                </p>

                <div className="mt-4">
                  <input
                    {...register("name", { required: REQUIRED_MESSAGE })}
                    defaultValue={org?.name || ""}
                    placeholder="Sunny Pets"
                    onKeyDown={onEnterNext}
                    className={twMerge(
                      "w-full bg-transparent text-center outline-none",
                      "border-0 ring-0 focus:ring-0 focus:border-0 appearance-none",
                      "font-bold font-jakarta text-[48px] leading-[1] text-brand_dark",
                      "placeholder:text-neutral-300"
                    )}
                  />
                  {errors["name"] ? (
                    <p className="mt-2 text-sm text-red-500">
                      {REQUIRED_MESSAGE}
                    </p>
                  ) : null}
                </div>

                <div className="mt-8 flex justify-center">
                  <PrimaryButton
                    type="button"
                    onClick={goNext as any}
                    isLoading={false}
                    isDisabled={false}
                    className="px-8"
                  >
                    Continuar <ArrowRight />
                  </PrimaryButton>
                </div>
              </div>
            )}

            {/* ===== Screen 2: Tu nombre ===== */}
            {screen === 1 && (
              <div className="relative z-10 mx-auto w-full max-w-6xl">
                <div className="grid gap-10 lg:grid-cols-[1fr_420px] items-start">
                  <div className="max-w-2xl">
                    <button
                      type="button"
                      onClick={() => setScreenAndUrl(0)}
                      className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800"
                    >
                      <span className="text-lg leading-none">‹</span> Volver
                    </button>

                    <p className=" font-jakarta text-[24px] font-bold text-brand_dark">
                      ¿Cuál es tu nombre?
                    </p>

                    <div className="mt-3">
                      <input
                        {...register("shopKeeper", {
                          required: REQUIRED_MESSAGE,
                        })}
                        defaultValue={org?.shopKeeper || ""}
                        placeholder="Luisita Sanchez"
                        onKeyDown={onEnterNext}
                        className={twMerge(
                          "w-full bg-transparent outline-none",
                          "border-0 ring-0 focus:ring-0 focus:border-0 appearance-none",
                          "font-bold font-jakarta text-[48px] leading-[1] text-brand_dark",
                          "placeholder:text-neutral-300"
                        )}
                      />
                      {errors["shopKeeper"] ? (
                        <p className="mt-2 text-sm text-red-500">
                          {REQUIRED_MESSAGE}
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-7 flex items-center gap-4">
                      <PrimaryButton
                        type="button"
                        onClick={goNext as any}
                        isLoading={false}
                        isDisabled={false}
                        className="px-8"
                      >
                        Continuar <ArrowRight />
                      </PrimaryButton>

                      <span className="flex items-center gap-2 text-sm text-neutral-400">
                        <span className="inline-flex h-8 w-8 items-center justify-center">
                          <svg
                            width="32"
                            height="32"
                            viewBox="0 0 32 32"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                          >
                            <rect
                              width="32"
                              height="32"
                              rx="8"
                              fill="#F0F0F0"
                            />
                            <path
                              d="M23 10C22.7348 10 22.4804 10.1054 22.2929 10.2929C22.1054 10.4804 22 10.7348 22 11V15C22 15.2652 21.8947 15.5196 21.7071 15.7071C21.5196 15.8946 21.2652 16 21 16H11.41L12.71 14.71C12.8983 14.5217 13.0041 14.2663 13.0041 14C13.0041 13.7337 12.8983 13.4783 12.71 13.29C12.5217 13.1017 12.2663 12.9959 12 12.9959C11.7337 12.9959 11.4783 13.1017 11.29 13.29L8.29002 16.29C8.19898 16.3851 8.12761 16.4972 8.08002 16.62C7.98 16.8635 7.98 17.1365 8.08002 17.38C8.12761 17.5028 8.19898 17.6149 8.29002 17.71L11.29 20.71C11.383 20.8037 11.4936 20.8781 11.6154 20.9289C11.7373 20.9797 11.868 21.0058 12 21.0058C12.132 21.0058 12.2627 20.9797 12.3846 20.9289C12.5065 20.8781 12.6171 20.8037 12.71 20.71C12.8037 20.617 12.8781 20.5064 12.9289 20.3846C12.9797 20.2627 13.0058 20.132 13.0058 20C13.0058 19.868 12.9797 19.7373 12.9289 19.6154C12.8781 19.4936 12.8037 19.383 12.71 19.29L11.41 18H21C21.7957 18 22.5587 17.6839 23.1213 17.1213C23.6839 16.5587 24 15.7956 24 15V11C24 10.7348 23.8947 10.4804 23.7071 10.2929C23.5196 10.1054 23.2652 10 23 10Z"
                              fill="#4B5563"
                            />
                          </svg>
                        </span>
                        <span>o usa Enter</span>
                      </span>
                    </div>
                  </div>

                  <div className="hidden lg:block">
                    <PreviewCard shopKeeper={shopKeeperLive} />
                  </div>
                </div>
              </div>
            )}

            {/* ===== Screen 3: Empleados ===== */}
            {screen === 2 && (
              <div
                className={twMerge(
                  "relative z-10 mx-auto w-full max-w-6xl",
                  "min-h-[calc(100vh-320px)] flex flex-col justify-center"
                )}
              >
                <div className="w-full flex justify-center">
                  <div
                    className={twMerge(
                      "grid w-full max-w-6xl gap-16 lg:gap-24",
                      "lg:grid-cols-[420px_420px]",
                      "items-center"
                    )}
                  >
                    <div className="max-w-xl">
                      <button
                        type="button"
                        onClick={() => setScreenAndUrl(1)}
                        className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800"
                      >
                        <span className="text-lg leading-none">‹</span> Volver
                      </button>

                      <p className="font-jakarta text-[24px] font-bold text-brand_dark">
                        ¿Cuántos empleados tiene tu negocio?
                      </p>

                      <div className="mt-5 space-y-3">
                        {OPTIONS.map((opt) => (
                          <label
                            key={opt}
                            className="font-jakarta flex items-center gap-3 font-medium text-[16px] leading-[1.25] text-brand_gray"
                          >
                            <input
                              type="radio"
                              value={opt}
                              {...register("numberOfEmployees", {
                                required: REQUIRED_MESSAGE,
                              })}
                              className="h-4 w-4"
                            />
                            <span>
                              {opt === "2"
                                ? "Solo 2"
                                : opt === "6 a 14"
                                ? "De 5 a 14"
                                : opt === "3 a 5"
                                ? "De 3 a 5"
                                : opt}
                            </span>
                          </label>
                        ))}
                      </div>

                      {errors["numberOfEmployees"] ? (
                        <p className="mt-3 text-sm text-red-500">
                          {REQUIRED_MESSAGE}
                        </p>
                      ) : null}

                      <div className="mt-8">
                        <PrimaryButton
                          isDisabled={false}
                          isLoading={fetcher.state !== "idle"}
                          type="submit"
                          className="px-8"
                        >
                          Continuar <ArrowRight />
                        </PrimaryButton>
                      </div>
                    </div>

                    <div className="hidden lg:flex justify-center translate-x-52">
                      <AvatarsRail />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </Form>
    </>
  );
};

/* ===========================
   UI helpers
   =========================== */

function PreviewCard({ shopKeeper }: { shopKeeper: string }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200">
      <h3 className="text-lg font-semibold text-neutral-900">Masaje Sueco</h3>
      <div className="mt-3 space-y-2 text-sm text-neutral-600">
        <div className="flex items-center gap-2">
          <span>📅</span> <span>19 de Agosto 2026, 10:00 am</span>
        </div>
        <div className="flex items-center gap-2">
          <span>🕒</span> <span>Sesión de 45 minutos</span>
        </div>
        <div className="flex items-center gap-2">
          <span>💲</span> <span>$999 mxn</span>
        </div>
        <div className="flex items-center gap-2">
          <span>👤</span> <span>Con {shopKeeper}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>📍</span>{" "}
          <span>Av. Guerrero #224, col. centro, CDMX, México</span>
        </div>
      </div>
    </div>
  );
}

function AvatarsRail() {
  const SIZE = 56;
  const R = SIZE / 2;
  const W = 420;
  const H = 480;
  const leftLineX = 100;
  const blue = { x: leftLineX - 70, y: 240 };
  const people = [
    { emoji: "👧🏻", x: 230, y: 60 },
    { emoji: "👨🏻", x: 270, y: 150 },
    { emoji: "👩🏻", x: 290, y: 240 },
    { emoji: "👨🏻‍🦰", x: 270, y: 330 },
    { emoji: "🧑🏻", x: 230, y: 420 },
  ];

  const Circle = ({
    emoji,
    x,
    y,
    blue,
    src,
  }: {
    emoji?: string;
    x: number;
    y: number;
    blue?: boolean;
    src?: string;
  }) => (
    <div
      className={twMerge(
        "absolute flex items-center justify-center rounded-full",
        blue
          ? "bg-neutral-100 shadow-[0_1px_0_rgba(0,0,0,0.02)]"
          : "bg-neutral-100 shadow-[0_1px_0_rgba(0,0,0,0.02)]"
      )}
      style={{
        width: SIZE,
        height: SIZE,
        left: x - R,
        top: y - R,
      }}
      aria-hidden="true"
    >
      {src ? (
        <img
          src={src}
          alt=""
          className="h-7 w-7 select-none pointer-events-none"
          draggable={false}
        />
      ) : (
        <span className="leading-none text-[18px]">{emoji}</span>
      )}
    </div>
  );

  return (
    <div className="relative flex items-center justify-center">
      <div className="relative" style={{ width: W, height: H }}>
        <div
          className="absolute border-l border-dashed border-neutral-200/70"
          style={{ left: leftLineX, top: 40, height: 400 }}
        />

        {people.map((p, i) => (
          <div
            key={i}
            className="absolute border-t border-dashed border-neutral-200/70"
            style={{
              left: i === 2 ? blue.x + R : leftLineX,
              top: p.y,
              width: i === 2 ? p.x - (blue.x + R) : p.x - leftLineX,
            }}
          />
        ))}

        <Circle x={blue.x} y={blue.y} blue src="/images/denik.png" />

        {people.map((p, idx) => (
          <Circle key={idx} emoji={p.emoji} x={p.x} y={p.y} />
        ))}
      </div>
    </div>
  );
}

/* ===========================
   Floating decorations
   =========================== */

   function FloatingEmojiText({
    emoji,
    className,
    variant,
    size = 30,
  }: {
    emoji: string;
    className: string;
    variant?: "blue";
    size?: number;
  }) {
    const drift = useMemo(() => (Math.random() > 0.5 ? 1 : -1), []);
  
    return (
      <motion.div
        className={twMerge(
          "absolute flex items-center justify-center",
          "h-14 w-14 rounded-full shadow-sm",
          variant === "blue" ? "bg-brand_blue" : "bg-neutral-100",
          className
        )}
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.9, y: 8, filter: "blur(6px)" }}
        animate={{
          opacity: 1,
          scale: 1,
          y: [0, -8, 0],
          x: [0, 4 * drift, 0],
          filter: "blur(0px)",
        }}
        transition={{
          opacity: { duration: 0.4 },
          scale: { type: "spring", bounce: 0.25, duration: 0.6 },
          filter: { duration: 0.4 },
          y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
          x: { duration: 6, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <span
          style={{
            fontSize: size,
            fontFamily: "Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji",
          }}
          className={twMerge(
            "leading-none",
            variant === "blue" ? "text-white" : "text-neutral-900"
          )}
        >
          {emoji}
        </span>
      </motion.div>
    );
  }
  

  function FloatingPillImageText({
    src,
    text,
    className,
  }: {
    src: string;
    text: string;
    className: string;
  }) {
    const drift = useMemo(() => (Math.random() > 0.5 ? 1 : -1), []);
  
    return (
      <motion.div
        className={twMerge(
          "absolute inline-flex items-center gap-3",
          "rounded-full bg-neutral-100",
          "px-2 py-1",
          className
        )}
        aria-hidden="true"
        initial={{ opacity: 0, y: 10, scale: 0.98, filter: "blur(8px)" }}
        animate={{
          opacity: 1,
          y: [0, -6, 0],
          x: [0, 3 * drift, 0],
          scale: 1,
          filter: "blur(0px)",
        }}
        transition={{
          opacity: { duration: 0.35 },
          scale: { type: "spring", bounce: 0.2, duration: 0.55 },
          filter: { duration: 0.35 },
          y: { duration: 5.2, repeat: Infinity, ease: "easeInOut" },
          x: { duration: 7, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <div className="h-4 w-4 rounded-full bg-brand_blue flex items-center justify-center">
          <img
            src={src}
            alt=""
            className="h-4 w-4 select-none pointer-events-none"
            draggable={false}
          />
        </div>
  
        <span className="text-1xl font-medium text-neutral-500 leading-none">
          {text}
        </span>
      </motion.div>
    );
  }
  

function FloatingEmojisStep1() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none select-none">
      <FloatingEmojiText emoji="💎" className="left-[20%] top-[5%]" />
      <FloatingEmojiText
        emoji="✨"
        className="left-[50%] top-[5%] -translate-x-1/2"
      />
      <FloatingEmojiText emoji="👩🏻‍🏫" className="right-[15%] top-[10%]" />
      <FloatingEmojiText emoji="👋🏻" className="left-[6%] top-[20%]" />
      <FloatingEmojiText emoji="🚀" className="right-[-8%] top-[54%]" />
      <FloatingEmojiText emoji="🎨" className="right-[8%] bottom-[16%]" />
      <FloatingEmojiText emoji="💃🏻" className="left-[5%] bottom-[30%]" />
      <FloatingEmojiText emoji="👀" className="left-[-10%] bottom-[14%]" />

      <FloatingPillImageText
        src="/images/denik-white.png"
        text="Agenda tu cita"
        className="left-[-2%] top-[45%]"
      />
      <FloatingPillImageText
        src="/images/denik-white.png"
        text="¿Qué horario prefieres?"
        className="right-[-4%] top-[35%]"
      />
    </div>
  );
}

function FloatingEmojisStep2() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none select-none">
      <motion.div
  className={twMerge(
    "absolute flex items-center justify-center",
    "h-14 w-14 rounded-full shadow-sm bg-brand_blue",
    "right-[20%] top-[18%] -translate-x-1/2"
  )}
  initial={{ opacity: 0, scale: 0.9, y: 10, filter: "blur(8px)" }}
  animate={{
    opacity: 1,
    scale: 1,
    y: [0, -8, 0],
    filter: "blur(0px)",
  }}
  transition={{
    opacity: { duration: 0.35 },
    scale: { type: "spring", bounce: 0.25, duration: 0.6 },
    filter: { duration: 0.35 },
    y: { duration: 4.8, repeat: Infinity, ease: "easeInOut" },
  }}
>
  <img
    src="/images/denik-white.png"
    alt=""
    className="h-7 w-7 select-none pointer-events-none"
    draggable={false}
  />
</motion.div>


      <FloatingEmojiText emoji="👋" className="right-[-10%] top-[22%]" />
      <FloatingEmojiText emoji="🧑‍🏫" className="left-[38%] top-[36%]" />
      <FloatingEmojiText emoji="🚀" className="left-[45%] top-[80%]" />
      <FloatingEmojiText emoji="🎨" className="left-[65%] top-[100%]" />
      <FloatingEmojiText emoji="💃🏻" className="right-[-5%] top-[79%]" />
    </div>
  );
}
