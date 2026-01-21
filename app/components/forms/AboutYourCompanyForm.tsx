import { Form } from "react-router";
import { type FieldValues, useForm } from "react-hook-form";
import { REQUIRED_MESSAGE } from "~/routes/login/signup.$stepSlug";
import { PrimaryButton } from "../common/primaryButton";
import { twMerge } from "tailwind-merge";
import { useFetcher, useSearchParams } from "react-router";
import { type Org } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "~/components/icons/arrowRight";

const OPTIONS = ["Solo yo", "2", "3 a 5", "6 a 14", "15 o más"];

export const AboutYourCompanyForm = ({ org }: { org: Org | null }) => {
  const fetcher = useFetcher();

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
        {screen === 0 ? <FloatingEmojisStep1 /> : null}
        {screen === 1 ? <FloatingEmojisStep2 /> : null}

        {/* ===== Screen 1: Nombre negocio ===== */}
        {screen === 0 && (
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
                <p className="mt-2 text-sm text-red-500">{REQUIRED_MESSAGE}</p>
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
                {/* ✅ Volver funciona: regresa a screen 0 */}
                <button
                  type="button"
                  onClick={() => setScreen(0)}
                  className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800"
                >
                  <span className="text-lg leading-none">‹</span> Volver
                </button>

                <p className="text-xl font-semibold text-neutral-900">
                  ¿Cuál es tu nombre?
                </p>

                <div className="mt-3">
                  <input
                    {...register("shopKeeper", { required: REQUIRED_MESSAGE })}
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
                    Continuar <ArrowRight />
                  </PrimaryButton>

                  <span className="text-sm text-neutral-400">o usa Enter</span>
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
                  "grid w-full max-w-5xl gap-16 lg:gap-24",
                  "lg:grid-cols-[420px_420px]",
                  "items-center"
                )}
              >
                <div className="max-w-xl">
                  {/* ✅ Volver NO empuja el layout: pegado al título */}
                  <button
                    type="button"
                    onClick={() => setScreen(1)}
                    className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800"
                  >
                    <span className="text-lg leading-none">‹</span> Volver
                  </button>

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
                      Continuar <ArrowRight />
                    </PrimaryButton>
                  </div>
                </div>

                {/* ✅ Figura un poco más a la derecha */}
                <div className="hidden lg:flex justify-center translate-x-52">
                  <AvatarsRail />
                </div>
              </div>
            </div>
          </div>
        )}
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
        // ✅ el “azul” lo dejamos con fondo gris como pediste:
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

        {/* ✅ Antes emoji, ahora PNG */}
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
  return (
    <div
      className={twMerge(
        "absolute flex items-center justify-center",
        "h-14 w-14 rounded-full shadow-sm",
        // ✅ sin border/ring
        variant === "blue" ? "bg-brand_blue" : "bg-neutral-100",
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

/** ✅ Pastilla como tu imagen: círculo azul con PNG + pill gris + texto */
function FloatingPillImageText({
  src,
  text,
  className,
}: {
  src: string;
  text: string;
  className: string;
}) {
  return (
    <div
      className={twMerge(
        "absolute inline-flex items-center gap-3",
        "rounded-full bg-neutral-100",
        "px-2 py-1",       
        className
      )}
      aria-hidden="true"
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
    </div>
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

      {/* ✅ Aquí van tus “bubbles” pero con PNG + texto */}
      <FloatingPillImageText
        src="/images/denik-white.png" // <-- tu PNG
        text="Agenda tu cita"
        className="left-[-2%] top-[45%]"
      />
      <FloatingPillImageText
        src="/images/denik-white.png" // <-- tu PNG
        text="¿Qué horario prefieres?"
        className="right-[-4%] top-[35%]"
      />
    </div>
  );
}

function FloatingEmojisStep2() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none select-none">
    
      <div
        className={twMerge(
          "absolute flex items-center justify-center",
          "h-14 w-14 rounded-full shadow-sm bg-brand_blue",
          "right-[20%] top-[18%] -translate-x-1/2"
        )}
      >
        <img
          src="/images/denik-white.png"
          alt=""
          className="h-7 w-7 select-none pointer-events-none"
          draggable={false}
        />
      </div>

      <FloatingEmojiText emoji="👋" className="right-[-10%] top-[22%]" />
      <FloatingEmojiText emoji="🧑‍🏫" className="left-[38%] top-[36%]" />
      <FloatingEmojiText emoji="🚀" className="left-[45%] top-[80%]" />
      <FloatingEmojiText emoji="🎨" className="left-[65%] top-[100%]" />
      <FloatingEmojiText emoji="💃🏻" className="right-[-5%] top-[79%]" />
    </div>
  );
}
