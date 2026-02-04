import { db } from "~/utils/db.server";

// Tipo de configuración de plugins en Org
export type OrgPlugins = Record<string, { enabled: boolean; config?: unknown }>;

export type PluginTab = {
  path: string;
  label: string;
};

export type PluginEventHandler = (
  data: unknown,
  orgId: string
) => Promise<void>;

export type Plugin = {
  id: string;
  name: string;
  description: string;
  icon: string;
  tabs?: PluginTab[];
  onEvent?: Record<string, PluginEventHandler>;
};

const plugins: Plugin[] = [];

export const register = (plugin: Plugin) => {
  plugins.push(plugin);
};

export const getAll = () => plugins;

export const get = (id: string) => plugins.find((p) => p.id === id);

export const isEnabled = async (
  orgId: string,
  pluginId: string
): Promise<boolean> => {
  const org = await db.org.findUnique({ where: { id: orgId } });
  const orgPlugins = org?.plugins as OrgPlugins | null;
  return orgPlugins?.[pluginId]?.enabled ?? false;
};

export const getTabs = async (orgId: string): Promise<PluginTab[]> => {
  const org = await db.org.findUnique({ where: { id: orgId } });
  const orgPlugins = org?.plugins as OrgPlugins | null;

  return plugins
    .filter((p) => orgPlugins?.[p.id]?.enabled)
    .flatMap((p) => p.tabs ?? []);
};

export const emit = async (
  event: string,
  data: unknown,
  orgId: string
): Promise<void> => {
  for (const plugin of plugins) {
    const handler = plugin.onEvent?.[event];
    if (handler && (await isEnabled(orgId, plugin.id))) {
      try {
        await handler(data, orgId);
      } catch (error) {
        console.error(`[Plugin ${plugin.id}] Error handling ${event}:`, error);
      }
    }
  }
};
