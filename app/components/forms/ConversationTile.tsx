// import type { Route } from "./+types/dash.profile";
// import { getUserOrRedirect } from "~/.server/userGetters";

// export const loader = async ({ request }) => {
//   const user = await getUserOrRedirect(request);
//   return { user };
// };

export const ConversationTile = ({ loaderData }: any) => {
    const { user } = loaderData;

    return (
        <div className="flex gap-2 border-b border-brand_pale py-4 last:border-0">
            <img
                className="w-14 h-14 rounded-full object-cover "
                src={user?.photoURL ? user?.photoURL : "/images/avatar-purple.svg"}
                alt="avatar"
            />
            <div className="flex flex-col">
                <p className="font-satoshi text-lg font-semibold">Usuario web 014</p>
                <p className="font-satoshi text-xs text-brand_medium_gray line-clamp-1">Con gusto. Actualmente tenemos 5 cursos disponibles 👩🏻‍🏫:</p>
            </div>
            <div>
                <p className="font-satoshi text-xs text-brand_medium_gray">ayer</p>
            </div>
        </div>
    )
}