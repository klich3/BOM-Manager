import { invoke } from "@tauri-apps/api/core";
import { useNotifications } from "@/composables/useNotifications";

export const useDialog = () => {
    const isTauri = typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__;

    const showConfirmation = async (title: string, message: string): Promise<boolean> => {
        if (isTauri) {
            try {
                return await invoke("show_confirmation_dialog", { title, message });
            } catch (error) {
                console.error("Error showing confirmation dialog:", error);
                // Fallback to browser confirm if Tauri dialog fails
                return confirm(`${title}\n${message}`);
            }
        } else {
            // Para modo web, usar confirm del navegador como fallback
            // En aplicaciones reales, esto debería conectarse a un sistema de modales global
            return confirm(`${title}\n${message}`);
        }
    };

    const showMessage = async (title: string, message: string, type: "info" | "warning" | "error" = "info"): Promise<void> => {
        if (isTauri) {
            try {
                await invoke("show_message_dialog", { title, message, dialogType: type });
            } catch (error) {
                console.error("Error showing message dialog:", error);
                // Fallback a notificaciones Toastify si Tauri dialog falla
                const { info, warning, error: errorMsg } = useNotifications();
                switch (type) {
                    case "error":
                        errorMsg(title, message);
                        break;
                    case "warning":
                        warning(title, message);
                        break;
                    case "info":
                    default:
                        info(title, message);
                        break;
                }
            }
        } else {
            // Para modo web, usar notificaciones Toastify
            const { info, warning, error: errorMsg } = useNotifications();
            switch (type) {
                case "error":
                    errorMsg(title, message);
                    break;
                case "warning":
                    warning(title, message);
                    break;
                case "info":
                default:
                    info(title, message);
                    break;
            }
        }
    };

    return {
        showConfirmation,
        showMessage,
        isTauri,
    };
};