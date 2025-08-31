// ruoyi 常用工具与字典 hook 的类型声明（JS 文件仍存在时提供类型）
import type { Ref } from 'vue'

interface DictItem {
    label: string
    value: string | number
    elTagType?: string
    elTagClass?: string
    [key: string]: any
}

interface UseDictStoreLike {
    getDict: (type: string) => DictItem[] | undefined
    setDict: (type: string, value: DictItem[]) => void
}

declare function useDict(...types: string[]): Record<string, Ref<DictItem[]>>

declare function parseTime(time?: any, pattern?: string): string | null
declare function resetForm(this: any, refName: string): void
declare function addDateRange<T extends Record<string, any>>(params: T, dateRange: any[], propName?: string): T
declare function selectDictLabel(datas: DictItem[], value: any): string
declare function selectDictLabels(datas: DictItem[], value: any, separator?: string): string
declare function sprintf(str: string, ...args: any[]): string
declare function parseStrEmpty(str: any): string
declare function mergeRecursive<T, U>(source: T, target: U): T & U
declare function handleTree(
    data: any[],
    id?: string,
    parentId?: string,
    children?: string
): any[]
declare function tansParams(params: Record<string, any>): string
declare function getNormalPath(p: string): string
declare function blobValidate(data: Blob): boolean

export {
    useDict,
    parseTime,
    resetForm,
    addDateRange,
    selectDictLabel,
    selectDictLabels,
    sprintf,
    parseStrEmpty,
    mergeRecursive,
    handleTree,
    tansParams,
    getNormalPath,
    blobValidate,
    DictItem,
    UseDictStoreLike
}