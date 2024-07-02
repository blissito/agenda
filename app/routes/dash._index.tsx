import { Form } from "@remix-run/react";
import { RouteTitle } from "~/components/sideBar/routeTitle";

export default function Page() {
  return (
    <section className="">
      <RouteTitle>Dash</RouteTitle>
      <Form className="flex justify-between">
        <input
          type="date"
          className="rounded-3xl border-none shadow-md focus:border-brand_blue transition-all"
        />
        <div className="flex gap-3">
          <select className="rounded-3xl border-none">
            <option value="">General</option>
          </select>
          <button className="rounded-full w-10 h-10 bg-white px-6 flex items-center justify-center">
            icon
          </button>
        </div>
      </Form>
    </section>
  );
}
