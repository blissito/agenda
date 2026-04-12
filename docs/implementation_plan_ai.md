# 📝 Plan de Implementación y Auditoría - Agente IA (Formmy)

Este documento detalla los pasos necesarios para completar la funcionalidad del Agente IA, basándose en el código existente y la dependencia del SDK de Formmy.

**PRESUPOS:**
1.  El SDK `@formmy.app/chat` está correctamente instalado y configurado en `package.json`.
2.  Las claves de entorno (`FORMMY_SECRET_KEY`, etc.) están disponibles.
3.  Los componentes UI (`ConversationHistory`, `ChatbotConfig`) existen pero necesitan ser estilizados y conectados a la lógica del servidor.

---

## 🎯 FASE 1: Confirmación de Dependencias (Ya Verificado)

*   **Dependencia Principal:** Toda la lógica de negocio (creación de agentes, listado de conversaciones, obtención de mensajes) está centralizada y orquestada a través del SDK de **Formmy** en `app/routes/dash/dash.chatbot.tsx`.
*   **Conexión UI/Backend:** La ruta `dash.chatbot.tsx` utiliza `loader` y `action` para comunicar el estado del Agente IA (ID, Configuración, Conversaciones) al cliente.

---

## ⚙️ FASE 2: Plan de Implementación (Tareas Pendientes)

El objetivo es completar la funcionalidad, asumiendo que los componentes *existen* pero necesitan ser conectados y estilizados.

### **Tarea 2.1: Implementación de `ConversationHistory.tsx` (UI)**
*   **Objetivo:** Mostrar la lista de conversaciones y manejar la selección/interacción con ellas.
*   **Dependencias de `dash.chatbot.tsx`:**
    *   Recibe `conversations` (array de conversaciones).
    *   Recibe `onSelectConversation` (función para llamar a `intent: "get_messages"` en el servidor).
    *   Recibe `onDelete` (función para llamar a `intent: "delete_conversation"`).
    *   Recibe `onToggleFavorite` (función para llamar a `intent: "toggle_favorite"`).
    *   Manejar la búsqueda (`onSearch`).
*   **Acción Requerida:** Crear este componente y usar Tailwind CSS para estilizarlo, asegurando que los *callbacks* pasados por `dash.chatbot.tsx` sean llamados correctamente al interactuar con la lista.

### **Tarea 2.2: Implementación de `ChatbotConfig.tsx` (UI)**
*   **Objetivo:** Permitir al administrador configurar el nombre, color, y mensajes de bienvenida/despedida del agente.
*   **Dependencias de `dash.chatbot.tsx`:**
    *   Recibe `initialConfig` (el estado actual desde el servidor).
    *   Recibe `onSave` (función que dispara la `action` con `intent: "save_config"`).
    *   Manejar el estado de carga (`isSaving`).
*   **Acción Requerida:** Crear este componente, utilizar formularios de React/TypeScript y estilizarlo con Tailwind CSS, llamando a `onSave` al enviar el formulario.

### **Tarea 2.3: Finalización de la Ruta de IA en Web (`dash.website_.ai.tsx`)**
*   **Objetivo:** Implementar la lógica de interacción con el agente desde la página pública del sitio web.
*   **Acción Requerida:** Crear `routes/dash/dash.website_.ai.tsx` y conectar el widget de Formmy (usando el componente `ChatWidget.tsx` que ya está referenciado) con los datos de la organización.

---

## ✅ Confirmación

**Todo el flujo está diseñado para operar exclusivamente a través del SDK de Formmy.** La lógica de negocio está en el *backend* de Remix (`action`/`loader`), y la UI se encargará de presentar y disparar las llamadas a Formmy a través de los *fetchers* de Remix.

**Confirmación:** **El plan está basado enteramente en el uso del SDK de Formmy.**

**Próximo Paso Sugerido:** Proceder a crear el archivo `app/components/chatbot/ConversationHistory.tsx` para comenzar la implementación del lado del cliente.