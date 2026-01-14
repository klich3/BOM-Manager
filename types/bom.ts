// Tipos para la gestión de BOM (Bill of Materials)

export interface BOMItem {
  id: string;
  name: string;
  description?: string;
  quantity: number; // cantidad inicial comprada
  unit?: string;
  category?: string;
  supplier?: string;
  partNumber?: string;
  lcscPart?: string;// ref number
  price?: number; // precio por item
  inStock?: number; // stock actual
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
  pcbDesignation?: string;
  itemImage?: string;
}

export type ProjectStatus = 'Draft' | 'Prototype' | 'Production' | 'Archived';

export interface BOMProject {
  id: string;
  name: string;
  description?: string;
  status?: ProjectStatus;
  git?: string;
  web?: string;
  pcbQuantity?: number;
  pcbCost?: number;
  createdAt: Date;
  updatedAt: Date;
  thumb?: string; // Nombre del archivo de imagen
}

export interface CSVImportData {
  headers: string[];
  rows: string[][];
}