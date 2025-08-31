export interface DictEntry<T = any> { key: string; value: T }
export interface DictState { dict: DictEntry[] }

const useDictStore = defineStore('dict', {
    state: (): DictState => ({
        dict: []
    }),
    actions: {
        getDict<T = any>(key: string | null | undefined): T[] | null {
            if (!key) return null
            for (let i = 0; i < this.dict.length; i++) {
                if (this.dict[i].key === key) {
                    return this.dict[i].value as T[]
                }
            }
            return null
        },
        setDict<T = any>(key: string | null | undefined, value: T[]) {
            if (key) {
                this.dict.push({ key, value })
            }
        },
        removeDict(key: string): boolean {
            const idx = this.dict.findIndex(e => e.key === key)
            if (idx !== -1) {
                this.dict.splice(idx, 1)
                return true
            }
            return false
        },
        cleanDict() {
            this.dict = []
        },
        initDict() {
            // 预留：可在此批量预加载需要的字典
        }
    }
})

export default useDictStore
