import { computed } from "vue";
import { useSettingsStore } from "@/stores/settings";
import es from "@/locales/es.json";
import en from "@/locales/en.json";

const translations: any = {
	es,
	en,
};

export const useI18n = () => {
	const settingsStore = useSettingsStore();
	const lang = computed(() => (settingsStore.settings.language as keyof typeof translations) || "es");

	const t = (key: string, params?: Record<string, string | number>): string => {
		const langData = translations[lang.value] || translations.es;
		let text = langData[key] || key;

		if (params) {
			Object.entries(params).forEach(([k, v]) => {
				text = text.replace(`{${k}}`, String(v));
			});
		}

		return text;
	};

	return {
		t,
		lang,
	};
};
