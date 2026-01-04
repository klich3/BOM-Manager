import { ref } from 'vue';

// Variable para verificar si estamos en entorno Tauri
const isTauri = typeof window !== "undefined" && !!(window as any).__TAURI_INTERNALS__;

export const useExternalLink = () => {
    const openExternalLink = async (url: string) => {
        if (isTauri) {
            try {
                // Intentar importar dinámicamente el plugin de shell de Tauri
                const { open } = await import("@tauri-apps/plugin-shell");
                await open(url);
            } catch (error) {
                console.error("Error opening external link in Tauri:", error);
                // Fallback: abrir en el navegador actual
                window.open(url, "_blank");
            }
        } else {
            // En entorno web, abrir en nueva pestaña
            window.open(url, "_blank");
        }
    };

    return {
        openExternalLink,
        isTauri
    };
};