import { Link } from "react-router"
import { Denik } from "../icons/denik"
import { Facebook } from "../icons/facebook"
import { Instagram } from "../icons/insta"
import { Linkedin } from "../icons/linkedin"
import { Youtube } from "../icons/youtube"

export const Footer = () => {
  return (
    <section>
      <section className=" w-[90%] md:max-w-7xl py-20 mx-auto flex flex-wrap lg:flex-nowrap justify-between border-b-[1px] border-white/10 gap-8 md:gap-0 box-border">
        <div className="w-full md:w-[25%]">
          <Denik fill="#ffffff" />
        </div>
        <div className="text-base text-brand_pale font-satoshi flex flex-col gap-4 w-full md:w-[25%]">
          <h3 className="text-brand_iron font-satoshi ">Deník</h3>
          {/* <Link to="/community">
            <p>Comunidad Deník</p>
          </Link> */}

          <Link to="/funcionalidades">
            <p>Funcionalidades</p>
          </Link>
          <Link to="/negocios">
            <p>Negocios</p>
          </Link>
          <Link to="/blog">
            <p>Blog</p>
              </Link>
             <Link to="/para-clientes">
            <p>Para clientes</p>
          </Link>
        </div>
        <div className="text-base text-brand_pale font-satoshi flex flex-col gap-4 w-full md:w-[25%]">
          <h3 className="text-brand_iron font-satoshi">Ayuda</h3>
          <Link to="/planes#preguntas-frecuentes">
            <p>Preguntas frecuentes</p>
          </Link>
             <Link to="/terminosycondiciones">
            <p>Términos y condiciones</p>
          </Link>
          <Link to="/avisodeprivacidad">
            <p>Aviso de privacidad</p>
          </Link>
        </div>
        <div className="text-base text-brand_pale font-satoshi w-full md:w-[25%]">
          <h3 className="text-brand_iron font-satoshi">Síguenos en redes</h3>
          <div className="flex mt-2">
            <a
              href="https://www.facebook.com/profile.php?id=61563700900314"
              target="_blank"
              rel="noopener"
              className="hover:opacity-50 transition-all"
            >
              <Facebook fill="#ffffff" className="scale-[60%]" />
            </a>
            <a
              href="https://www.linkedin.com/company/104767180"
              target="_blank"
              rel="noopener"
              className="hover:opacity-50 transition-all scale-[80%]"
            >
              <Linkedin fill="#ffffff" />
            </a>
            <a
              href="https://www.instagram.com/denik_agenda/"
              target="_blank"
              rel="noopener"
              className="hover:opacity-50 transition-all scale-[70%]"
            >
              <Instagram fill="#ffffff" />
            </a>
            {/* <a
              href="https://www.linkedin.com/company/104767180"
              target="_blank"
              rel="noopener"
            >
            <Twitter fill="#ffffff" />
            </a> */}
            <a
              href="https://www.youtube.com/@Den%C3%ADk-v9s"
              target="_blank"
              rel="noopener"
              className="hover:opacity-50 transition-all scale-[90%]"
            >
              <Youtube fill="#ffffff" />
            </a>
          </div>
          <a href="mailto:hola@denik.me" className="block mt-4 hover:opacity-70 transition-opacity">
            hola@denik.me
          </a>
          <Link to="/instalar" className="block mt-4 hover:opacity-70 transition-opacity">
            Instala Deník
          </Link>
        </div>
      </section>
      <p className="text-brand_iron font-satoshi text-sm text-center py-6">
        Todos los derechos reservados Deník® 2026
      </p>
    </section>
  )
}
