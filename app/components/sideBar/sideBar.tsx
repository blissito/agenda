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

export function SideBar({
  user,
  children,
  ...props
}: {
  children?: ReactNode;
  user: User;
  props?: unknown;
}) {
  return (
    <article className="min-h-screen bg-brand_light_gray flex " {...props}>
      <aside className="w-[320px] bg-white h-screen fixed rounded-e-3xl flex flex-col">
        <Header user={user} className="pl-6" />
        <MainMenu />
        <Footer />
      </aside>
      <section className="pl-[360px] pr-10 py-10 w-full ">{children}</section>
    </article>
  );
}

const Header = ({
  className,
  user,
}: {
  className?: string;
  user: Partial<User>;
}) => {
  return (
    <header className={twMerge(className)}>
      <Denik className="mb-6 mt-6" />
      {user && <User user={user} />}
      <hr className="my-4 max-w-[80%]" />
    </header>
  );
};

const Footer = () => {
  const location = useLocation();
  const match = (string: string) => location.pathname.includes(string);
  return (
    <div className="mt-auto">
      <h3 className="pl-10 pb-3 uppercase text-xs text-gray-300">Ajustes</h3>
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
      <MenuButton>
        <MenuButton.Icon>
          <Out />
        </MenuButton.Icon>
        <MenuButton.Title>
          <Form action="/signin">
            <button type="submit" name="intent" value="logout">
              Cerrar sesión
            </button>
          </Form>
        </MenuButton.Title>
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
        <MenuButton to="/dash/website" isActive={match("website")}>
          <MenuButton.Icon isActive={match("website")}>
            <Website />
          </MenuButton.Icon>
          <MenuButton.Title isActive={match("website")}>
            Sitio web
          </MenuButton.Title>
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
  <div className="flex flex-col text-brand_dark">
    <img
      className="w-10 rounded-full mr-2"
      alt="avatar"
      src={user.photoURL ?? "https://loremflickr.com/640/480?lock=1234"}
      onError={(e) => {
        console.log("Error loading Avatar image");
        e.target.src = "https://loremflickr.com/640/480?lock=1234";
      }}
    />
    <div className="grid">
      <p className="text-lg font-satoMiddle mb-0">{user.name}</p>
      <p className="text-gray-400 font-thin -mt-1">{user.email}</p>
    </div>
  </div>
);
