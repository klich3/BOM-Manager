import { useDatabase } from "@/composables/useDatabase";
import { useNotifications } from "@/composables/useNotifications";
import * as XLSX from "xlsx";
import type { BOMItem } from "@/types/bom";

export const useExport = () => {
	const db = useDatabase();
	const { success, error } = useNotifications();

	/**
	 * Exporta items a CSV
	 */
	const exportToCSV = async (items: BOMItem[], filename: string = "inventory.csv") => {
		try {
			if (items.length === 0) {
				error("Exportación fallida", "No hay datos para exportar");
				return false;
			}

			// Convertir items a formato CSV
			const csvContent = convertToCSV(items);

			// Crear blob y descargar
			const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
			const link = document.createElement("a");
			const url = URL.createObjectURL(blob);

			link.setAttribute("href", url);
			link.setAttribute("download", filename);
			link.style.visibility = "hidden";

			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			success("Exportación exitosa", `Archivo ${filename} descargado correctamente`);
			return true;
		} catch (err) {
			console.error("Error exportando a CSV:", err);
			error("Exportación fallida", "Error al exportar a CSV");
			return false;
		}
	};

	/**
	 * Exporta items a XLSX
	 */
	const exportToExcel = async (items: BOMItem[], filename: string = "inventory.xlsx") => {
		try {
			if (items.length === 0) {
				error("Exportación fallida", "No hay datos para exportar");
				return false;
			}

			// Convertir items a formato de hoja de cálculo
			const worksheetData = convertToWorksheetData(items);
			const worksheet = XLSX.utils.json_to_sheet(worksheetData);

			// Ajustar ancho de columnas
			const range = XLSX.utils.decode_range(worksheet["!ref"] || "");
			const cols = [];
			for (let C = range.s.c; C <= range.e.c; ++C) {
				cols.push({ wch: 15 }); // Ancho estándar de 15 caracteres
			}
			worksheet["!cols"] = cols;

			// Crear libro de trabajo y hoja
			const workbook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario");

			// Exportar archivo
			XLSX.writeFile(workbook, filename);

			success("Exportación exitosa", `Archivo ${filename} descargado correctamente`);
			return true;
		} catch (err) {
			console.error("Error exportando a Excel:", err);
			error("Exportación fallida", "Error al exportar a Excel");
			return false;
		}
	};

	/**
	 * Exporta todos los items del inventario
	 */
	const exportAllInventory = async (format: "csv" | "xlsx" = "xlsx") => {
		try {
			const items = await db.getAllItems();
			const filename = `inventario_${new Date().toISOString().split("T")[0]}.${format}`;

			if (format === "csv") {
				return await exportToCSV(items as BOMItem[], filename);
			} else {
				return await exportToExcel(items as BOMItem[], filename);
			}
		} catch (err) {
			console.error("Error exportando inventario completo:", err);
			error("Exportación fallida", "Error al exportar inventario completo");
			return false;
		}
	};

	/**
	 * Convierte items a formato CSV
	 */
	const convertToCSV = (items: BOMItem[]): string => {
		if (items.length === 0) return "";

		// Obtener encabezados
		const headers = [
			"name",
			"description",
			"quantity",
			"unit",
			"category",
			"supplier",
			"partNumber",
			"lcscPart",
			"price",
			// 'inStock', // Eliminado porque ya no se usa
			"minStock",
			"notes",
			"createdAt",
			"updatedAt",
		];

		// Convertir items a arrays
		const rows = items.map((item) => [
			item.name,
			item.description || "",
			item.quantity,
			item.unit,
			item.category || "",
			item.supplier || "",
			item.partNumber || "",
			item.lcscPart || "",
			item.price || "",
			// item.inStock, // Eliminado porque ya no se usa
			item.minStock || "",
			item.notes || "",
			item.createdAt,
			item.updatedAt,
		]);

		// Unir encabezados y filas
		const csvContent = [
			headers.join(","),
			...rows.map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")),
		].join("\n");

		return csvContent;
	};

	/**
	 * Convierte items a formato de hoja de cálculo
	 */
	const convertToWorksheetData = (items: BOMItem[]): any[] => {
		return items.map((item) => ({
			Nombre: item.name,
			Descripción: item.description || "",
			Cantidad: item.quantity,
			Unidad: item.unit,
			Categoría: item.category || "",
			Proveedor: item.supplier || "",
			"Número de Parte": item.partNumber || "",
			"Parte LCSC": item.lcscPart || "",
			Precio: item.price || 0,
			// 'Stock Actual': item.inStock, // Eliminado porque ya no se usa
			"Stock Mínimo": item.minStock || 0,
			Notas: item.notes || "",
			Creado: new Date(item.createdAt).toLocaleDateString(),
			Actualizado: new Date(item.updatedAt).toLocaleDateString(),
		}));
	};

	/**
	 * Exporta lista de compra a CSV
	 */
	const exportShoppingList = (items: any[]): string => {
		if (items.length === 0) return "";
		const headers = ["Nombre", "Part Number", "LCSC Part", "Requerido", "Disponible", "A Comprar"];
		const rows = items.map((item) => [
			item.name,
			item.partNumber || "",
			item.lcscPart || "",
			item.needed,
			item.available,
			item.toOrder,
		]);
		const csvContent = [
			headers.join(","),
			...rows.map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")),
		].join("\n");
		return csvContent;
	};

	return {
		exportToCSV,
		exportToExcel,
		exportAllInventory,
		exportShoppingList,
		convertToCSV,
		convertToWorksheetData,
	};
};
