// Vitest manual mock for pinia used by unit tests to avoid pulling real Pinia runtime
export const defineStore = (_id: string, options: any) => () => options
export const storeToRefs = (store: any) => store
export default { defineStore, storeToRefs }