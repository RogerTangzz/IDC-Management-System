// Vitest manual mock for pinia used by unit tests to avoid pulling real Pinia runtime
export const defineStore = (_id: string, options: any) => () => {
	const stateObj = options.state ? options.state() : {}
	const actions = options.actions || {}
	const instance: any = { ...stateObj }
	Object.keys(actions).forEach(k => {
		instance[k] = (actions as any)[k].bind(instance)
	})
	return instance
}
export const storeToRefs = (store: any) => store
export default { defineStore, storeToRefs }