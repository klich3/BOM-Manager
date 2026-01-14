import { Command } from '@tauri-apps/plugin-shell';
import { appDataDir } from '@tauri-apps/api/path';
import { ref } from 'vue';

export const useGitSync = () => {
    const isTauri = typeof window !== "undefined" && !!(window as any).__TAURI_INTERNALS__;
    const isSyncing = ref(false);
    const lastSync = ref<string | null>(null);

    const runGitCommand = async (args: string[]) => {
        if (!isTauri) return { success: false, error: 'Git sync solo disponible en versión de escritorio' };

        try {
            const dataDir = await appDataDir();
            const command = Command.create('git', args, { cwd: dataDir });
            const output = await command.execute();

            if (output.code === 0) {
                return { success: true, stdout: output.stdout };
            } else {
                return { success: false, error: output.stderr || 'Error desconocido de Git' };
            }
        } catch (error) {
            console.error('Error ejecutando comando Git:', error);
            return { success: false, error: String(error) };
        }
    };

    const setupRemote = async (url: string) => {
        // 1. Git init if not exists
        await runGitCommand(['init']);
        // 2. Add remote
        const result = await runGitCommand(['remote', 'add', 'origin', url]);
        if (!result.success && result.error?.includes('already exists')) {
            await runGitCommand(['remote', 'set-url', 'origin', url]);
        }
        return { success: true };
    };

    const sync = async () => {
        isSyncing.value = true;
        try {
            // 1. Add all changes
            await runGitCommand(['add', '.']);
            // 2. Commit
            await runGitCommand(['commit', '-m', `Auto-sync: ${new Date().toISOString()}`]);
            // 3. Pull with rebase
            await runGitCommand(['pull', 'origin', 'main', '--rebase']);
            // 4. Push
            const pushResult = await runGitCommand(['push', 'origin', 'main']);

            if (pushResult.success) {
                lastSync.value = new Date().toLocaleString();
                return { success: true };
            } else {
                return { success: false, error: pushResult.error };
            }
        } catch (error) {
            return { success: false, error: String(error) };
        } finally {
            isSyncing.value = false;
        }
    };

    return {
        isSyncing,
        lastSync,
        setupRemote,
        sync
    };
};
