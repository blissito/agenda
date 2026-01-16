import { Form } from "react-router";
import { type FieldValues, useForm } from "react-hook-form";
import { REQUIRED_MESSAGE } from "~/routes/login/signup.$stepSlug";
import { PrimaryButton } from "../common/primaryButton";
import { twMerge } from "tailwind-merge";
import { useFetcher, useSearchParams } from "react-router";
import { type Org } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const OPTIONS = ["Solo yo", "2", "3 a 5", "6 a 14", "15 o más"];

export const AboutYourCompanyForm = ({ org }: { org: Org | null }) => {
  const fetcher = useFetcher();

  // ✅ Lee /signup/1?screen=0|1|2 para arrancar en la pantalla correcta
  const [searchParams] = useSearchParams();

  const initialScreen = useMemo<0 | 1 | 2>(() => {
    const s = searchParams.get("screen");
    if (s === "2") return 2;
    if (s === "1") return 1;
    return 0;
  }, [searchParams]);

  const [screen, setScreen] = useState<0 | 1 | 2>(initialScreen);

  const {
    handleSubmit,
    register,
    setValue,
    trigger,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: { ...org },
  });

  const onSubmit = (values: FieldValues) => {
    fetcher.submit(
      { intent: "update_org", data: JSON.stringify(values), next: "/signup/2" },
      { method: "post" }
    );
  };

  useEffect(() => {
    setValue("numberOfEmployees", "Solo yo", { shouldValidate: true });
  }, []);

  const goNext = async () => {
    if (screen === 0) {
      const ok = await trigger("name");
      if (ok) setScreen(1);
      return;
    }
    if (screen === 1) {
      const ok = await trigger("shopKeeper");
      if (ok) setScreen(2);
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
        {/* ✅ Decoraciones SOLO por step */}
        {screen === 0 ? <FloatingEmojisStep1 /> : null}
        {screen === 1 ? <FloatingEmojisStep2 /> : null}

        {/* ✅ Transición entre screens */}
        <AnimatePresence mode="wait">
          {/* ===== Screen 1: Nombre negocio ===== */}
          {screen === 0 && (
            <motion.div
              key="screen-0"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-full"
            >
              <div className="relative z-10 mx-auto w-full max-w-5xl text-center">
                <div className="mx-auto mb-8 flex w-full justify-center">
                  <img
                    src="/images/signin/Screen.svg"
                    alt="preview"
                    className="h-[110px] w-auto select-none pointer-events-none"
                    draggable={false}
                  />
                </div>

                <p className="text-base font-semibold text-neutral-900">
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
                      "text-4xl md:text-5xl font-semibold text-neutral-900",
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
                    Continuar
                  </PrimaryButton>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===== Screen 2: Tu nombre ===== */}
          {screen === 1 && (
            <motion.div
              key="screen-1"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-full"
            >
              <div className="relative z-10 mx-auto w-full max-w-6xl">
                <button
                  type="button"
                  onClick={() => setScreen(0)}
                  className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800"
                >
                  <span className="text-lg leading-none">‹</span> Volver
                </button>

                <div className="grid gap-10 lg:grid-cols-[1fr_420px] items-start">
                  <div className="max-w-2xl">
                    <p className="text-xl font-semibold text-neutral-900">
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
                          "text-4xl md:text-5xl font-semibold text-neutral-900",
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
                        Continuar
                      </PrimaryButton>

                      <span className="text-sm text-neutral-400">
                        o usa Enter
                      </span>
                    </div>
                  </div>

                  <div className="hidden lg:block">
                    <PreviewCard />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===== Screen 3: Empleados ===== */}
          {screen === 2 && (
            <motion.div
              key="screen-2"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-full"
            >
              <div
                className={twMerge(
                  "relative z-10 mx-auto w-full max-w-6xl",
                  // ✅ centrado vertical general del step 3 (solo UI)
                  "min-h-[calc(100vh-320px)] flex flex-col justify-center"
                )}
              >
                <button
                  type="button"
                  onClick={() => setScreen(1)}
                  className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800"
                >
                  <span className="text-lg leading-none">‹</span> Volver
                </button>

                {/* ✅ centra el grid en horizontal y alinea ambos al centro */}
                <div className="w-full flex justify-center">
                  <div
                    className={twMerge(
                      "grid w-full max-w-5xl gap-16 lg:gap-24",
                      "lg:grid-cols-[420px_420px]",
                      "items-center"
                    )}
                  >
                    {/* izquierda */}
                    <div className="max-w-xl">
                      <p className="text-xl font-semibold text-neutral-900">
                        ¿Cuántos empleados tiene tu negocio?
                      </p>

                      <div className="mt-5 space-y-3">
                        {OPTIONS.map((opt) => (
                          <label
                            key={opt}
                            className="flex items-center gap-3 text-sm text-neutral-700"
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
                          Continuar
                        </PrimaryButton>
                      </div>
                    </div>

                    {/* derecha (avatars) */}
                    <div className="hidden lg:flex justify-center">
                      <AvatarsRail />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Form>
    </>
  );
};

/* ===========================
   UI helpers (solo diseño)
   =========================== */

function PreviewCard() {
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
          <span>👤</span> <span>Con Luisita Sanchez</span>
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
  }: {
    emoji: string;
    x: number;
    y: number;
    blue?: boolean;
  }) => (
    <div
      className={twMerge(
        "absolute flex items-center justify-center rounded-full",
        blue
          ? "bg-brand_blue shadow-[0_10px_28px_rgba(60,80,255,0.22)]"
          : "bg-white ring-1 ring-neutral-200/60 shadow-[0_1px_0_rgba(0,0,0,0.02)]"
      )}
      style={{
        width: SIZE,
        height: SIZE,
        left: x - R,
        top: y - R,
      }}
      aria-hidden="true"
    >
      <span
        className={twMerge(
          "leading-none",
          blue ? "text-white text-[18px]" : "text-[18px] opacity-90"
        )}
      >
        {emoji}
      </span>
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

        <Circle emoji={"🧑‍💼"} x={blue.x} y={blue.y} blue />
        {people.map((p, idx) => (
          <Circle key={idx} emoji={p.emoji} x={p.x} y={p.y} />
        ))}
      </div>
    </div>
  );
}

/* ===========================
   Emoji “como texto” (reusable)
   =========================== */
function FloatingEmojiText({
  emoji,
  className,
  variant,
  size = 22,
}: {
  emoji: string;
  className: string;
  variant?: "blue";
  size?: number;
}) {
  return (
    <div
      className={twMerge(
        "absolute flex items-center justify-center",
        "h-14 w-14 rounded-full shadow-sm ring-1",
        variant === "blue"
          ? "bg-brand_blue ring-brand_blue/30"
          : "bg-white/80 ring-neutral-200/70",
        className
      )}
      aria-hidden="true"
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
    </div>
  );
}

/* ===========================
   Step 1 emojis (TEXT)
   =========================== */
function FloatingEmojisStep1() {
  const Bubble = ({ text, className }: { text: string; className: string }) => (
    <div
      className={twMerge(
        // compacto
        "absolute inline-flex w-fit items-center gap-2 rounded-full",
        "bg-white px-3 py-1.5",
        "text-xs text-neutral-700",
        "shadow-[0_1px_2px_rgba(0,0,0,0.06)]",
        "ring-1 ring-neutral-200/60",
        className
      )}
    >
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand_blue text-white text-[10px]">
        R
      </span>
      <span className="leading-none">{text}</span>
    </div>
  );

  return (
    <div className="absolute inset-0 z-0 pointer-events-none select-none">
      {/* STEP 1: AQUÍ MUEVES POSICIONES (className) */}
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

      {/* BUBBLES: aquí mueves su posición */}
      <Bubble text="Agenda tu cita" className="left-[-5%] top-[45%]" />
      <Bubble text="¿Qué horario prefieres?" className="right-[-10%] top-[35%]" />
    </div>
  );
}

/* ===========================
   Step 2 emojis (TEXT)
   =========================== */
function FloatingEmojisStep2() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none select-none">
      {/* STEP 2: AQUÍ MUEVES POSICIONES (className) */}
      <FloatingEmojiText
        emoji="🧾"
        variant="blue"
        className="right-[20%] top-[18%] -translate-x-1/2"
      />

      <FloatingEmojiText emoji="👋" className="right-[-10%] top-[22%]" />
      <FloatingEmojiText emoji="🧑‍🏫" className="left-[38%] top-[36%]" />

      <FloatingEmojiText emoji="🚀" className="left-[45%] top-[80%]" />
      <FloatingEmojiText emoji="🎨" className="left-[65%] top-[100%]" />
      <FloatingEmojiText emoji="💃🏻" className="right-[-5%] top-[79%]" />
    </div>
  );
}
