import { FormEvent, useState } from "react";

export default function Page() {
  const [value, set] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    set(
      (event.currentTarget.elements.namedItem("email") as HTMLInputElement)
        .value
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-100 grid place-content-center h-screen"
    >
      <h1>Blissmo ejemplo: {value}</h1>
      <input type="text" name="email" />
    </form>
  );
}
