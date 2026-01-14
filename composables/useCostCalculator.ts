import { ref, computed } from 'vue';
import type { BOMItem } from '@/types/bom';
import { useSettingsStore } from '@/stores/settings';

export interface CostCalculation {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    currency: string;
}

export interface ProjectCostBreakdown {
    items: {
        item: BOMItem;
        quantity: number;
        unitCost: number;
        totalCost: number;
    }[];
    summary: CostCalculation;
}

export const useCostCalculator = () => {
    const settingsStore = useSettingsStore();
    const taxRate = ref(0.19); // 19% por defecto
    const shippingCost = ref(0);
    const currency = computed(() => settingsStore.settings.currency);
    const decimals = computed(() => settingsStore.settings.decimals);

    /**
     * Calcula el costo total de un proyecto basado en sus items
     */
    const calculateProjectCost = (
        items: BOMItem[],
        quantities: Record<string, number> = {},
        customTaxRate?: number,
        customShippingCost?: number
    ): ProjectCostBreakdown => {
        const effectiveTaxRate = customTaxRate ?? taxRate.value;
        const effectiveShippingCost = customShippingCost ?? shippingCost.value;

        // Calcular costos por item
        const itemCosts = items.map(item => {
            const quantity = quantities[item.id] ?? item.quantity ?? 1;
            const unitCost = item.price ?? 0;
            const totalCost = quantity * unitCost;

            return {
                item,
                quantity,
                unitCost,
                totalCost
            };
        });

        // Calcular subtotal
        const subtotal = itemCosts.reduce((sum, itemCost) => sum + itemCost.totalCost, 0);

        // Calcular impuestos
        const tax = subtotal * effectiveTaxRate;

        // Calcular total
        const total = subtotal + tax + effectiveShippingCost;

        const summary: CostCalculation = {
            subtotal,
            tax,
            shipping: effectiveShippingCost,
            total,
            currency: currency.value
        };

        return {
            items: itemCosts,
            summary
        };
    };

    /**
     * Calcula el costo de un solo item
     */
    const calculateItemCost = (item: BOMItem, quantity: number = 1): number => {
        return (item.price ?? 0) * quantity;
    };

    /**
     * Calcula el costo total de múltiples items con cantidades específicas
     */
    const calculateTotalCost = (
        items: BOMItem[],
        quantities: Record<string, number> = {}
    ): number => {
        return items.reduce((total, item) => {
            const quantity = quantities[item.id] ?? item.quantity ?? 1;
            return total + calculateItemCost(item, quantity);
        }, 0);
    };

    /**
     * Formatear monto monetario
     */
    const formatCurrency = (amount: number, curr: string = currency.value): string => {
        const lang = settingsStore.settings.language === 'es' ? 'es-ES' : 'en-US';
        return new Intl.NumberFormat(lang, {
            style: 'currency',
            currency: curr,
            minimumFractionDigits: decimals.value,
            maximumFractionDigits: decimals.value
        }).format(amount);
    };

    /**
     * Actualiza la tasa de impuestos
     */
    const setTaxRate = (rate: number) => {
        taxRate.value = Math.max(0, Math.min(1, rate)); // Limitar entre 0 y 1
    };

    /**
     * Actualiza el costo de envío
     */
    const setShippingCost = (cost: number) => {
        shippingCost.value = Math.max(0, cost); // Asegurar que sea positivo
    };

    /**
     * Obtiene estadísticas de costos
     */
    const getCostStatistics = (items: BOMItem[]) => {
        const costs = items
            .filter(item => item.price !== undefined && item.price !== null)
            .map(item => item.price as number);

        if (costs.length === 0) {
            return {
                min: 0,
                max: 0,
                average: 0,
                total: 0
            };
        }

        const total = costs.reduce((sum, cost) => sum + cost, 0);
        const min = Math.min(...costs);
        const max = Math.max(...costs);
        const average = total / costs.length;

        return {
            min,
            max,
            average,
            total
        };
    };

    return {
        taxRate: computed(() => taxRate.value),
        shippingCost: computed(() => shippingCost.value),
        currency,

        calculateProjectCost,
        calculateItemCost,
        calculateTotalCost,
        formatCurrency,
        setTaxRate,
        setShippingCost,
        getCostStatistics
    };
};
