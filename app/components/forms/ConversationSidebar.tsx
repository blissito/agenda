import { ConversationTile } from "./ConversationTile"


export const ConversationSidebar = () => {
    return (
      <section className="bg-white px-4 rounded-3xl flex flex-col justify-start h-full">
            <ConversationTile loaderData="nul line-clamp-1"/>
            <ConversationTile loaderData="nul"/>
      </section>
    )
}
