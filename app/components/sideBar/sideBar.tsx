import { type User } from "@prisma/client";
import { Form, Link, useLocation } from "@remix-run/react";
import { Children, cloneElement, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { Dashboard } from "~/components/icons/dashboard";
import { Agenda } from "../icons/menu/agenda";
import { Services } from "../icons/menu/services";
import { Website } from "../icons/menu/webiste";
import { Financial } from "../icons/menu/financial";
import { Clients } from "../icons/menu/clients";
import { Loyalty } from "../icons/menu/loyalty";
import { Rank } from "../icons/menu/rank";
import { Settings } from "../icons/menu/settings";
import { Profile } from "../icons/menu/profile";
import { Help } from "../icons/menu/help";
import { Out } from "../icons/menu/out";
import { Denik } from "../icons/denik";
import { PrimaryButton } from "../common/primaryButton";
import {
  useAnimate,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";

export function SideBar({
  user,
  children,
  ...props
}: {
  children?: ReactNode;
  user: User;
  props?: unknown;
}) {
  const isClosed = useMotionValue(false);
  const [scope, animate] = useAnimate();
  const x = useMotionValue(0);
  const t = useTransform(x, [-300, 0, 300], [60, 360, 660]);

  const handleClick = () => {
    if (!isClosed) return;
    animate("#aside", { x: 0 }, { type: "spring", bounce: 0.2 }); // open
  };

  const handleDragEnd = () => {
    if (x.get() < -180) {
      animate("#aside", { x: -300 }, { type: "spring", bounce: 0.5 }); // close
      isClosed.set(true);
    } else {
      animate(
        "#aside",
        { x: 0 },
        { type: "spring", bounce: 0.5, duration: 0.5 }
      ); // open
      isClosed.set(false);
    }
  };

  return (
    <article
      ref={scope}
      className="bg-brand_light_gray flex h-auto min-h-screen relative z-500 "
      {...props}
    >
      <motion.aside
        dragElastic={0.5}
        whileTap={{ cursor: "grabbing" }}
        id="aside"
        onDragEnd={handleDragEnd}
        dragSnapToOrigin
        drag="x"
        dragConstraints={{ right: 0, left: -300 }}
        key="spring"
        // transition={{ type: "spring", bounce: 0.7 }}
        style={{
          x,
        }}
        className="w-[320px] bg-white fixed rounded-e-3xl flex flex-col justify-end h-screen overflow-hidden"
      >
        <Header
          dragElement={
            <button
              onClick={handleClick}
              className="h-12 rounded-full w-2 bg-brand_gray/30 absolute bottom-0 right-1 cursor-grab active:cursor-grabbing hover:bg-brand_gray/40 hover:scale-110 transition-all"
            />
          }
          user={user}
          className="pl-6"
          handleDragEnd={handleDragEnd}
        />
        <MainMenu className="mb-auto" />
        <OnboardingBanner />
        <Footer />
      </motion.aside>
      <motion.section
        style={{ paddingLeft: t }}
        className="pl-[360px] pr-10 py-10 w-full  "
      >
        {children}
      </motion.section>
    </article>
  );
}

const Header = ({
  className,
  handleDragEnd,
  user,
  onClick,
  dragElement,
}: {
  dragElement?: ReactNode;
  handleDragEnd?: () => void;
  onClick?: () => void;
  className?: string;
  user: Partial<User>;
}) => {
  return (
    <header className={twMerge("relative", className)}>
      <Denik className="mb-6 mt-6" />
      {user && <User user={user} />}
      <hr className="my-4 max-w-[80%]" />
      {dragElement}
    </header>
  );
};

const Footer = () => {
  const location = useLocation();
  const match = (string: string) => location.pathname.includes(string);
  return (
    <div className="">
      <h3 className="pl-10 uppercase text-xs text-gray-300">Ajustes</h3>
      <MenuButton to="/dash/profile" isActive={match("profile")}>
        <MenuButton.Icon isActive={match("profile")}>
          <Profile />
        </MenuButton.Icon>
        <MenuButton.Title isActive={match("profile")}>Perfil</MenuButton.Title>
      </MenuButton>
      <MenuButton>
        <MenuButton.Icon>
          <Help />
        </MenuButton.Icon>
        <MenuButton.Title>Ayuda</MenuButton.Title>
      </MenuButton>
      <Form action="/signin">
        <button
          type="submit"
          name="intent"
          value="logout"
          className="flex pl-6 gap-3 text-base pb-3 hover:text-gray-700 font-title h-12 items-center"
        >
          <Out />
          Cerrar sesión
        </button>
      </Form>
    </div>
  );
};

const MenuButton = ({
  isActive = false,
  className,
  children,
  to = "",
  ...props
}: {
  to?: string;
  className?: string;
  props?: unknown;
  isActive?: boolean;
  children?: ReactNode;
}) => {
  const Element = to ? Link : "button";
  return (
    <Element
      to={to}
      className={twMerge(
        isActive && "text-brand_blue",
        className,
        "relative h-12 flex items-center gap-3 cursor-pointer"
      )}
      {...props}
    >
      <span
        className={twMerge(
          "mr-2 w-1 h-11",
          isActive && "bg-brand_blue rounded-e-lg"
        )}
      />
      {children}
    </Element>
  );
};

const Icon = ({
  children,
  isActive,
  ...props
}: {
  isActive?: boolean;
  children?: ReactNode;
  props?: unknown;
}) => (
  <i {...props}>
    {isActive
      ? Children.map(children, (c) => cloneElement(c, { fill: "#5158F6" }))
      : children}
  </i>
);
const Title = ({
  children,
  isActive,
  ...props
}: {
  isActive?: boolean;
  children?: ReactNode;
  props?: unknown;
}) => (
  <h3
    className={twMerge(
      "hover:opacity-70",
      "text-base text-brand_dark",
      isActive && "text-brand_blue"
    )}
    {...props}
  >
    {children}
  </h3>
);
MenuButton.Icon = Icon;
MenuButton.Title = Title;

const MainMenu = ({ className }: { className?: string }) => {
  const location = useLocation();
  const match = (string: string) => location.pathname.includes(string);
  const matchIndex = (string: string = location.pathname) =>
    /^\/dash$/.test(string);

  return (
    <div className={twMerge("overflow-auto mb-auto h-full", className)}>
      <h3 className="pl-6 pb-0 uppercase text-xs text-gray-300">Tu negocio</h3>
      <section className="gri ">
        <MenuButton isActive={matchIndex()} to="/dash">
          <MenuButton.Icon isActive={matchIndex()}>
            <Dashboard />
          </MenuButton.Icon>
          <MenuButton.Title isActive={matchIndex()}>Dashboard</MenuButton.Title>
        </MenuButton>
        <MenuButton to="/dash/agenda" isActive={match("agenda")}>
          <MenuButton.Icon isActive={match("agenda")}>
            <Agenda />
          </MenuButton.Icon>
          <MenuButton.Title isActive={match("agenda")}>Agenda</MenuButton.Title>
        </MenuButton>
        <MenuButton to="/dash/website" isActive={match("website")}>
          <MenuButton.Icon isActive={match("website")}>
            <Website />
          </MenuButton.Icon>
          <MenuButton.Title isActive={match("website")}>
            Sitio web
          </MenuButton.Title>
        </MenuButton>
        <MenuButton to="/dash/servicios" isActive={match("servicios")}>
          <MenuButton.Icon isActive={match("servicios")}>
            <Services />
          </MenuButton.Icon>
          <MenuButton.Title isActive={match("servicios")}>
            Servicios
          </MenuButton.Title>
        </MenuButton>
        <MenuButton>
          <MenuButton.Icon>
            <Financial />
          </MenuButton.Icon>
          <MenuButton.Title>Pagos</MenuButton.Title>
        </MenuButton>
        <MenuButton to="/dash/clients" isActive={match("clients")}>
          <MenuButton.Icon isActive={match("clients")}>
            <Clients />
          </MenuButton.Icon>
          <MenuButton.Title isActive={match("clients")}>
            Clientes
          </MenuButton.Title>
        </MenuButton>
        <MenuButton>
          <MenuButton.Icon>
            <Loyalty />
          </MenuButton.Icon>
          <MenuButton.Title>Lealtad</MenuButton.Title>
        </MenuButton>
        <MenuButton>
          <MenuButton.Icon>
            <Rank />
          </MenuButton.Icon>
          <MenuButton.Title>Evaluaciones</MenuButton.Title>
        </MenuButton>
        <MenuButton to="/dash/ajustes" isActive={match("ajustes")}>
          <MenuButton.Icon isActive={match("ajustes")}>
            <Settings />
          </MenuButton.Icon>
          <MenuButton.Title isActive={match("ajustes")}>
            Ajustes
          </MenuButton.Title>
        </MenuButton>
      </section>
    </div>
  );
};

const User = ({ user }: { user: Partial<User> }) => (
  <div className="flex  text-brand_dark">
    <img
      className={twMerge(
        "w-12 h-12 object-cover border-2 border-brand_blue rounded-full mr-2"
        // "self-center"
      )}
      alt="avatar"
      src={user.photoURL ?? "https://loremflickr.com/640/480?lock=1234"}
      onError={(e) => {
        console.log("Error loading Avatar image");
        e.target.src = "https://loremflickr.com/640/480?lock=1234";
      }}
    />
    <div className="grid">
      <p className="text-lg font-satoMiddle mb-0">{user.displayName}</p>
      <p className="text-gray-400 font-thin -mt-1">{user.email}</p>
    </div>
  </div>
);

const OnboardingBanner = () => {
  return (
    <section className="relative p-3 mx-6 mb-6 border-[1px] bg-banner bg-cover text-white border-brand_stroke rounded-2xl h-[120px] mt-4">
      <img
        className="w-24 absolute right-2 -top-10"
        src="/images/3dagenda.png"
        alt="banner"
      />
      <p className="text-base mb-3 font-satoMiddle w-[80%]">
        ¡Ya casi terminas de configurar tu agenda!
      </p>
      <PrimaryButton
        className="min-w-[100px] max-w-[100px] px-3 h-8 bg-white text-brand_dark"
        as="Link"
        to={"/dash/onboarding"}
        prefetch="render"
      >
        Continuar
      </PrimaryButton>
    </section>
  );
};
