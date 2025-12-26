// Tipos para la gestión de BOM (Bill of Materials)

export interface BOMItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  category?: string;
  supplier?: string;
  partNumber?: string;
  lcscPart?: string;
  price?: number;
  inStock: number;
  minStock?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BOMProject {
  id: string;
  name: string;
  description?: string;
  items: BOMItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CSVImportData {
  headers: string[];
  rows: string[][];
}
