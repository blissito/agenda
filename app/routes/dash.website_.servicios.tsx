import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrump";
import { PrimaryButton } from "~/components/common/primaryButton";
import { SecondaryButton } from "~/components/common/secondaryButton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Switch } from "~/components/forms/Switch";
import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <section>
      <Breadcrumb className="text-brand_gray">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dash/website">Mi sitio web</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dash/website/servicios">
              Servicios
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="bg-white rounded-2xl max-w-3xl p-8 mt-6">
        <Table>
          <TableCaption>
            <Link to="/dash/servicios">
              <p className="text-left ml-4 underline text-brand_blue">
                Editar servicios
              </p>
            </Link>
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Servicio</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead className="text-right">Mostrar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">
                <ServiceItem serviceName="Clase de canto" />
              </TableCell>
              <TableCell>60 min</TableCell>
              <TableCell>$399.00</TableCell>
              <TableCell className="text-right">
                <Switch name="available" />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <div className="flex mt-16 justify-end gap-6">
          <SecondaryButton as="Link" to="/dash/website" className="w-[120px]">
            Cancelar
          </SecondaryButton>
          <PrimaryButton>Guardar</PrimaryButton>
        </div>
      </div>
    </section>
  );
}

const ServiceItem = ({
  serviceName,
  img,
}: {
  serviceName: string;
  img?: string;
}) => {
  return (
    <div className="flex gap-4 items-center">
      <img
        className="w-16 h-10 object-cover rounded-lg"
        src={img ? img : "/images/serviceDefault.png"}
      />
      <h3 className="font-satoMiddle text-brand_dark">{serviceName}</h3>
    </div>
  );
};
