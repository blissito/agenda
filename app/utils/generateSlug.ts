import { nanoid } from "nanoid";

export const generateSlug = (string: string, addDate: boolean = true) => {
  if (typeof string !== "string") return "";
  return (
    string
      .toString() // Cast to string
      .toLowerCase() // Convert the string to lowercase letters
      .normalize("NFD") // The normalize() method returns the Unicode Normalization Form of a given string.
      .trim() // Remove whitespace from both sides of a string
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/[^\w\-]+/g, "") // Remove all non-word chars
      .replace(/\-\-+/g, "-") + (addDate ? `-${nanoid(6)}` : "")
  );
};

export const generateLink = (uri: string, orgSlug: string) => {
  const url = new URL(uri);
  url.pathname = `/agenda/${orgSlug}`;
  return url.toString();
};
