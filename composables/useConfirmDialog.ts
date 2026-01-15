import { ref } from "vue";

interface ConfirmOptions {
	title: string;
	message: string;
	type?: "info" | "warning" | "error";
	confirmText?: string;
	cancelText?: string;
}

const isOpen = ref(false);
const options = ref<ConfirmOptions>({
	title: "",
	message: "",
	type: "info",
	confirmText: "Confirmar",
	cancelText: "Cancelar",
});

let resolvePromise: ((value: boolean) => void) | null = null;

export const useConfirmDialog = () => {
	const showConfirmation = (opts: ConfirmOptions): Promise<boolean> => {
		return new Promise((resolve) => {
			options.value = { ...opts };
			isOpen.value = true;
			resolvePromise = resolve;
		});
	};

	const handleConfirm = () => {
		isOpen.value = false;
		if (resolvePromise) {
			resolvePromise(true);
			resolvePromise = null;
		}
	};

	const handleCancel = () => {
		isOpen.value = false;
		if (resolvePromise) {
			resolvePromise(false);
			resolvePromise = null;
		}
	};

	return {
		isOpen,
		options,
		showConfirmation,
		handleConfirm,
		handleCancel,
	};
};
