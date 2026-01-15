import { computed, unref } from "vue";
import { useSettingsStore } from "@/stores/settings";
import es from "@/locales/es.json";
import en from "@/locales/en.json";
import ru from "@/locales/ru.json";
import fr from "@/locales/fr.json";
import de from "@/locales/de.json";

const translations: any = {
	es,
	en,
	ru,
	fr,
	de,
};

export const useI18n = () => {
	const settingsStore = useSettingsStore();
	const lang = computed(() => (settingsStore.settings.language as keyof typeof translations) || "es");

	const t = (key: string, params?: Record<string, string | number>): string => {
		const langData = translations[lang.value] || translations.es;
		
		// Support for nested keys like "lists_mgmt.title"
		const keys = key.split('.');
		let result = langData;
		
		for (const k of keys) {
			if (result && result[k] !== undefined) {
				result = result[k];
			} else {
				result = key;
				break;
			}
		}
		
		let text = typeof result === 'string' ? result : key;

		if (params) {
			Object.entries(params).forEach(([k, v]) => {
				text = text.replace(`{${k}}`, String(unref(v)));
			});
		}

		return text;
	};

	return {
		t,
		lang,
	};
};
