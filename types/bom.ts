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
  lcscPart?: string;
  price?: number;
  // inStock: number; // Eliminado porque ya no se usa
  minStock?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  manufacturer?: string;
  customerNo?: string;
  package?: string;
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