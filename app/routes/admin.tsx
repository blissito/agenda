import { ActionFunctionArgs } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { scheduleMail } from "~/lib/hokify_agenda";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "agenda_experiment") {
    const when = formData.get("when") as string;
    scheduleMail({
      template: "send_experiment",
      emails: ["brenda@fixter.org", "fixtergeek@gmail.com", "hola@formmy.app"],
      // @todo How to assure timezonne?
      when: when
        ? when
        : new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate(),
            // new Date().getHours(),
            20,
            15
            // new Date().getMinutes() + 1
          ),
    });
  }

  return null;
};

export default function Route() {
  return (
    <article className="bg-gray-300 h-screen flex items-center justify-center flex-col gap-8">
      <h2 className="text-4xl">Blissmo's Agendamiento experiment</h2>
      <Form method="POST">
        <input
          name="when"
          type="datetime-local"
          className="rounded-xl py-2 px-2 mr-2"
          required
        />
        <button
          name="intent"
          value="agenda_experiment"
          type="submit"
          className="active:bg-indigo-700 hover:bg-indigo-600 py-2 px-4 bg-indigo-500 rounded-xl text-gray-200"
        >
          Agendar correo
        </button>
      </Form>
    </article>
  );
}
