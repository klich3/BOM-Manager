// Tipos para la base de datos
export interface Database {
    select<T = any[]>(query: string, params?: any[]): Promise<T>;
    execute(query: string, params?: any[]): Promise<any>;
}