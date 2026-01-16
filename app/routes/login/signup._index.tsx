import { redirect } from "react-router";

export const loader = () => {
  throw redirect("/signup/1");
};
