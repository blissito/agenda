import { z } from "zod";
import { generateSlug } from "./generateSlug";
import { db } from "./db.server";
import { Org } from "@prisma/client";

// aux functions for signup process

export const notifyConfigSchema = z.object({
  confirmation: z.boolean().default(true),
  reminder: z.boolean().default(true),
  survey: z.boolean().default(true),
});

export const serviceSchema = z.object({
  name: z.string().min(1),
  slug: z.string(),
  price: z.number(),
  config: notifyConfigSchema,
  employeeName: z.string().min(1),
  photoURL: z.string().min(11),
});

const defaultConfig = {
  confirmation: true,
  reminder: true,
  survey: true,
};

const templates = [
  {
    config: defaultConfig,
    name: "Limpieza dental para dragon",
    slug: "limpieza-dental-para-dragon",
    price: 1999,
    employeeName: "Daenerys Targaryen",
    photoURL:
      "https://upload.wikimedia.org/wikipedia/en/0/0d/Daenerys_Targaryen_with_Dragon-Emilia_Clarke.jpg",
  },
  {
    config: defaultConfig,
    name: "Clase de escritura literaria",
    slug: generateSlug("Clase de escritura literaria"),
    price: 2890,
    employeeName: "Julio Cortazar",
    photoURL:
      "https://media.admagazine.com/photos/618a63bca8ad6c5249a74efa/16:9/w_2656,h_1494,c_limit/74842.jpg",
  },
  {
    config: defaultConfig,
    name: "Instrucción a la técnica de retroalimentación con guitarra eléctrica",
    slug: generateSlug(
      "Instrucción a la técnica de retroalimentación con guitarra eléctrica"
    ),
    price: 199,
    employeeName: "Jimi Hendrix",
    photoURL:
      "https://media.admagazine.com/photos/618a63bca8ad6c5249a74efa/16:9/w_2656,h_1494,c_limit/74842.jpghttps://raulsandoval.mx/wp-content/uploads/2024/05/Como-tocar-la-guitarra-como-Jimi-Hendrix.jpg",
  },
  {
    config: defaultConfig,
    name: "24 vueltas en pista profesional #22",
    slug: generateSlug("24 vueltas en pista profesional #22"),
    price: 48_500,
    employeeName: "Checo Perez",
    photoURL:
      "https://fotografias.lasexta.com/clipping/cmsimages02/2022/05/31/C5D89425-396E-444C-9C97-72B334E58B10/checo-perez-renueva-red-bull-dos-temporadas-mas_98.jpg?crop=2865,1612,x0,y36&width=1900&height=1069&optimize=high&format=webply",
  },
];

export const getOneTemplate = () =>
  templates[Math.floor(Math.random() * templates.length)];

export const generateDummyService = async (org: Org) =>
  await db.service.create({
    data: {
      ...getOneTemplate(),
      address: org.address,
      orgId: org.id,
    },
  });
