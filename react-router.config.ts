import type { Config } from "@react-router/dev/config";

export default {
  prerender: ["/"],
  ssr: true,
} satisfies Config;
