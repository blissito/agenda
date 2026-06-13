import { redirect } from "react-router"

// La gestión de sucursales vive ahora en /dash/ajustes?tab=sucursales.
// Mantenemos este redirect para links viejos.
export const loader = () => redirect("/dash/ajustes?tab=sucursales")
