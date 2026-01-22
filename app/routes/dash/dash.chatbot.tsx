import { useState } from "react";
import { Link } from "react-router";
import { PrimaryButton } from "~/components/common/primaryButton";
import { ConversationSidebar } from "~/components/forms/ConversationSidebar";
import { ConversationView } from "~/components/forms/ConversationView";
import { SearchInput } from "~/components/forms/SearchInput";
import { EditBrush } from "~/components/icons/editBrush";
import { MagnifyingGlass } from "~/components/icons/magnifyingGlass";
import { RouteTitle } from "~/components/sideBar/routeTitle";
import { ActionButton } from "./dash.clientes";
import { WhatsAppIcon } from "~/components/icons/whatsappIcon";

interface EmptyStateChatbotProps {
  onActivate: () => void;
}

export default function Chatbot() {
  const [isActive, setIsActive] = useState(false)

  return (
    <main>
      {!isActive ? <EmptyStateChatbot onActivate={() => setIsActive(true)}/> 
      : <>
        <RouteTitle>Ghosty: Tu chatbot IA</RouteTitle>
        <ChatbotPage/>
      </>}
    </main>
  );
}

const EmptyStateChatbot = ({ onActivate }: EmptyStateChatbotProps) => {
  return (
    <div className=" w-full h-[80vh] bg-cover  mt-10 flex justify-center items-center">
      <div className="text-center">
        <img className="mx-auto mb-4" src="/images/puzzle.svg" />
        <p className="font-satoMedium text-xl font-bold">
          Conoce a Ghosty: tu asistente inteligente de agendamiento
        </p>
        <p className="mt-2 text-brand_gray">
          Deník trabaja con FormmyApp para potenciar tu agenda digital con Inteligencia Artificial.
        </p>
        <PrimaryButton className="mx-auto mt-12" onClick={onActivate}>
          Activar
        </PrimaryButton>
      </div>
    </div>
  );
};

const ChatbotPage = () => {
  return (
    <div className="w-full h-[80vh] mt-10">
      <div className="flex gap-3">
        <SearchInput 
          name="searchMessage"
          icon={<MagnifyingGlass/>}
          type="search"
          placeholder="Buscar mensaje"
          containerClassName="flex items-center"
          labelClassName="hidden"
          label="search messages"
        />
        <div className="flex gap-3">
          <Link to="">
            <ActionButton className="relative bg-white hover:bg-brand_wa_green transition-colors rounded-full h-12 w-12 cursor-pointer border-none">
              <WhatsAppIcon />
            </ActionButton>
          </Link>
          <Link to="">
            <ActionButton className="relative bg-white rounded-full h-12 w-12 cursor-pointer border-none">
              <EditBrush />
            </ActionButton>
          </Link>
        </div>
      </div>
      <div className="flex h-[70vh] mt-6 gap-6">
        <ConversationSidebar/>
        <ConversationView className="w-full" loaderData="null"/>
      </div>
    </div>
  );
};
