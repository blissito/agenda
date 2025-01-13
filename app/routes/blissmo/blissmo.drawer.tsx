import { Form } from "@remix-run/react";
import { useState } from "react";
import { Drawer } from "~/components/animated/SimpleDrawer";

export default function Route() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div className="flex justify-center gap-4">
        <h1 className="h-[300vh]">Drawerr</h1>
        <button
          className="w-40 h-20 bg-blue-500 text-white"
          onClick={() => setIsOpen(true)}
        >
          Open
        </button>
      </div>
      <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Form>
          <h2 className="h-[300vh] bg-blue-500">Form</h2>
        </Form>
      </Drawer>
    </>
  );
}
