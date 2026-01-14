import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';

export const useNativeNotifications = () => {
    const isTauri = typeof window !== "undefined" && !!(window as any).__TAURI_INTERNALS__;

    const notify = async (title: string, body: string) => {
        if (!isTauri) {
            console.log('Notificación (Web):', title, body);
            return;
        }

        try {
            let permission = await isPermissionGranted();
            if (!permission) {
                const permissionStatus = await requestPermission();
                permission = permissionStatus === 'granted';
            }

            if (permission) {
                sendNotification({ title, body, icon: 'info' });
            }
        } catch (error) {
            console.error('Error enviando notificación nativa:', error);
        }
    };

    return {
        notify
    };
};
