import { DialogButton } from "../common/DialogButton"
import { SecondaryButton } from "../common/secondaryButton"
import { ArrowRight } from "../icons/arrowRight"
import { Meteors } from "./Meteors"

// @ Meteors require Banner to be wrapped in a Suspense!
export const Banner = () => {
  return (
    <section className="max-w-[90%] xl:max-w-7xl w-full mx-auto rounded-[40px] bg-brand_dark my-20 md:my-[160px] p-8 md:py-16 md:px-[10%] xl:px-[5%] relative overflow-hidden text-center">
      <h2 className="text-2xl lg:text-4xl text-white font-bold">
        30 días gratis para transformar tu agenda
      </h2>
      <p className="text-xl lg:text-2xl text-brand_ash/80 mt-6 font-satoshi">
        Agenda citas, cobra en línea y deja que la IA atienda a tus clientes
        mientras tú te enfocas en lo que mejor haces.
      </p>
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 mt-12 justify-center">
        {/* <PrimaryButton className="w-full md:w-[180px]">
          Probar gratis <ArrowRight />{" "}
        </PrimaryButton> */}
        <DialogButton>
          Crear una cuenta gratis <ArrowRight />{" "}
        </DialogButton>
        <a href="https://wa.me/525539111285?text=¡Hola!%20Quiero%agendar%20un%demo.">
          <SecondaryButton className="w-full md:w-[180px]">
            Agendar demo{" "}
          </SecondaryButton>
        </a>
      </div>
      <Meteors />
    </section>
  )
}
