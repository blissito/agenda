import { nanoid } from "nanoid";
import { convertToMeridian } from "~/routes/dash/dash.servicios_.$serviceId";
// @todo: escape from custom funcs
export const formatRange = (array: [string, string][]) => {
  if (!array) return "Cerrado";
  return array.map((tuple, i) => (
    <div key={nanoid()}>
      de {convertToMeridian(tuple[0])} a {convertToMeridian(tuple[1])}{" "}
      {array.length > 1 && i < array.length - 1 ? "y" : null}
    </div>
  ));
};
