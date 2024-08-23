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
    name: "Limpieza dental para dragón",
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
      "https://raulsandoval.mx/wp-content/uploads/2024/05/Como-tocar-la-guitarra-como-Jimi-Hendrix.jpg",
  },
  {
    config: defaultConfig,
    name: "Experiencia Culinaria",
    slug: generateSlug("Experiencia Culinaria"),
    price: 500,
    employeeName: "Cheff Gordon Ramsay",
    photoURL:
      "https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
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
