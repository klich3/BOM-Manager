declare module '*.json' {
    const content: any;
    export default content;
    export const tables: {
        name: string;
        definition: string;
    }[];
}