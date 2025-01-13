import { Link } from "react-router";
import { Denik } from "../icons/denik";
import { Facebook } from "../icons/facebook";
import { Linkedin } from "../icons/linkedin";
import { Instagram } from "../icons/insta";
import { Twitter } from "../icons/twitter";
import { Youtube } from "../icons/youtube";

export const Footer = () => {
  return (
    <section>
      <section className=" w-[90%] md:max-w-7xl py-20 mx-auto flex flex-wrap lg:flex-nowrap justify-between border-b-[1px] border-white/10 gap-8 md:gap-0 box-border">
        <div className="w-full md:w-[25%]">
          <Denik fill="#ffffff" />
        </div>
        <div className="text-base text-brand_pale font-satoshi flex flex-col gap-4 w-full md:w-[25%]">
          <h3 className="text-brand_iron font-satoshi text-sm">Deník</h3>
          <Link to="/404">
            <p>Comunidad Deník</p>
          </Link>

          <Link to="/help">
            <p>Blog</p>
          </Link>
          {/* <p>Atención al cliente</p> */}
          <Link to="/terminosycondiciones">
            <p>Términos y condiciones</p>
          </Link>
          <p>Aviso de privacidad</p>
        </div>
        <div className="text-base text-brand_pale font-satoshi flex flex-col gap-4 w-full md:w-[25%]">
          <h3 className="text-brand_iron font-satoshi">Contacto</h3>
          <a>hola@denik.me</a>
          <a>+52 737 443 44 44</a>
          <Link to="/help">
            <p>Ayuda</p>
          </Link>
        </div>
        <div className="w-full md:w-[25%]">
          <p className="text-brand_iron font-satoshi">
            Suscríbete a nuestro newsletter para recibir promociones
          </p>
          <div className="flex mt-10">
            <a
              href="https://www.facebook.com/profile.php?id=61563700900314"
              target="_blank"
              rel="noopener"
              className="hover:opacity-50 transition-all"
            >
              <Facebook fill="#707376" />
            </a>
            <a
              href="https://www.linkedin.com/company/104767180"
              target="_blank"
              rel="noopener"
              className="hover:opacity-50 transition-all"
            >
              <Linkedin fill="#707376" />
            </a>
            <a
              href="https://www.linkedin.com/company/104767180"
              target="_blank"
              rel="noopener"
              className="hover:opacity-50 transition-all"
            >
              <Instagram fill="#707376" />
            </a>
            {/* <a
              href="https://www.linkedin.com/company/104767180"
              target="_blank"
              rel="noopener"
            >
            <Twitter fill="#707376" />
            </a> */}
            <a
              href="https://www.youtube.com/@Den%C3%ADk-v9s"
              target="_blank"
              rel="noopener"
              className="hover:opacity-50 transition-all"
            >
              <Youtube fill="#707376" />
            </a>
          </div>
        </div>
      </section>
      <p className="text-brand_iron font-satoshi text-sm text-center py-6">
        Todos los derechos reservados Deník® 2024
      </p>
    </section>
  );
};
