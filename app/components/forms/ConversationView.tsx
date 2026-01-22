import { Link } from "react-router";
import { ActionButton } from "~/routes/dash/dash.clientes";
import { DownloadIcon } from "../icons/downloadIcon";
import { ChatBot } from "../icons/chatbot";
import { TrashIcon } from "../icons/trashIcon";

export const ConversationView = ({ loaderData }: any) => {
    const { user } = loaderData;

    return (
        <div className="flex flex-col justify-start h-full w-full rounded-3xl bg-chat bg-fixed">
            <div className="flex justify-between bg-white py-4 px-6 rounded-t-3xl">
                <div className="flex gap-4">
                    <img
                        className="w-14 h-14 rounded-full object-cover "
                        src={user?.photoURL ? user?.photoURL : "/images/avatar-purple.svg"}
                        alt="avatar"
                    />
                    <div className="flex flex-col">
                        <p className="font-satoshi text-lg font-semibold">Usuario web 014</p>
                        <p className="font-satoshi text-xs text-brand_medium_gray line-clamp-1">18 Julio 2025, 10:30 am</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link to="">
                        <ActionButton className="relative bg-white hover:bg-brand_blue transition-colors rounded-full h-10 w-10 cursor-pointer border-none">
                            <ChatBot />
                        </ActionButton>
                    </Link>
                    <Link to="">
                        <ActionButton className="relative bg-white rounded-full h-10 w-10 cursor-pointer border-none">
                            <DownloadIcon />
                        </ActionButton>
                    </Link>
                    <Link to="">
                        <ActionButton className="relative bg-white hover:bg-brand_light_red transition-colors rounded-full h-10 w-10 cursor-pointer border-none">
                            <TrashIcon />
                        </ActionButton>
                    </Link>
                </div>
            </div>
        </div>
    )
}