// Tipos para la gestión de BOM (Bill of Materials)

export interface BOMItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit?: string;
  category?: string;
  supplier?: string;
  partNumber?: string;
  lcscPart?: string;// ref number
  price?: number; // precio por item
  // inStock: number; // Eliminado porque ya no se usa
  minStock?: number; // minima cantidad para lanzar alerta
  notes?: string;

  createdAt: string;  // Fecha en formato string
  updatedAt: string;  // Fecha en formato string

  manufacturer?: string; // fabricante
  package?: string; //empaquetado

  customerNo?: string;
  rohs?: string;
  extPrice?: number;
  leadTime?: number;
  dateCodeLotNo?: string;
  status?: string;
}

export interface BOMProject {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CSVImportData {
  headers: string[];
  rows: string[][];
}