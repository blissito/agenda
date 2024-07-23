import { type User } from "@prisma/client";
import { Link, useLocation } from "@remix-run/react";
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

export function SideBar({
  user,
  children,
  ...props
}: {
  children?: ReactNode;
  user?: Partial<User>;
  props?: unknown;
}) {
  return (
    <article className="min-h-screen bg-brand_light_gray flex " {...props}>
      <aside className="w-[320px] bg-white min-h-screen rounded-e-3xl flex flex-col">
        <Header user={user} className="pl-6" />
        <MainMenu />
        <Footer />
      </aside>
      <section className="pl-10 py-10 w-full">{children}</section>
    </article>
  );
}

const Header = ({
  className,
  user,
}: {
  className?: string;
  user?: Partial<User>;
}) => {
  return (
    <header className={twMerge(className)}>
      <span className="text-indigo-500 text-3xl block py-6">Denik</span>
      {user && <User user={user} />}
      <hr className="my-6 max-w-[80%]" />
    </header>
  );
};

const Footer = () => {
  return (
    <div className="mt-auto">
      <h3 className="pl-10 pb-3 uppercase text-xs text-gray-300">Ajustes</h3>
      <MenuButton>
        <MenuButton.Icon>
          <Profile />
        </MenuButton.Icon>
        <MenuButton.Title>Perfil</MenuButton.Title>
      </MenuButton>
      <MenuButton>
        <MenuButton.Icon>
          <Help />
        </MenuButton.Icon>
        <MenuButton.Title>Ayuda</MenuButton.Title>
      </MenuButton>
      <MenuButton>
        <MenuButton.Icon>
          <Out />
        </MenuButton.Icon>
        <MenuButton.Title>Cerrar sesión</MenuButton.Title>
      </MenuButton>
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
      "text-lg text-brand_dark",
      isActive && "text-brand_blue"
    )}
    {...props}
  >
    {children}
  </h3>
);
MenuButton.Icon = Icon;
MenuButton.Title = Title;

const MainMenu = () => {
  const location = useLocation();
  const match = (string: string) => location.pathname.includes(string);
  const matchIndex = (string: string = location.pathname) =>
    /^\/dash$/.test(string);

  return (
    <div className="">
      <h3 className="pl-6 pb-3 uppercase text-xs text-gray-300">Tu negocio</h3>
      <section className="grid gap-1">
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
        <MenuButton>
          <MenuButton.Icon>
            <Website />
          </MenuButton.Icon>
          <MenuButton.Title>Sitio web</MenuButton.Title>
        </MenuButton>
        <MenuButton to="/dash/services" isActive={match("services")}>
          <MenuButton.Icon isActive={match("services")}>
            <Services />
          </MenuButton.Icon>
          <MenuButton.Title isActive={match("services")}>
            Servicios
          </MenuButton.Title>
        </MenuButton>
        <MenuButton>
          <MenuButton.Icon>
            <Financial />
          </MenuButton.Icon>
          <MenuButton.Title>Pagos</MenuButton.Title>
        </MenuButton>
        <MenuButton>
          <MenuButton.Icon>
            <Clients />
          </MenuButton.Icon>
          <MenuButton.Title>Clientes</MenuButton.Title>
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
        <MenuButton>
          <MenuButton.Icon>
            <Settings />
          </MenuButton.Icon>
          <MenuButton.Title>Ajustes</MenuButton.Title>
        </MenuButton>
      </section>
    </div>
  );
};

const User = ({ user }: { user: Partial<User> }) => (
  <div className="flex items-center text-brand_dark">
    <img
      className="w-12 rounded-full mr-2"
      alt="avatar"
      src={user.photoURL ?? undefined}
    />
    <div className="grid">
      <p className="text-2xl font-medium">{user.name}</p>
      <p className="text-gray-400 font-thin">{user.email}</p>
    </div>
  </div>
);
