/**
 * API通用响应类型定义
 */

// 基础API响应结构
export interface ApiResult<T = any> {
  code: number
  msg: string
  data: T
}

// 分页响应结构
export interface PageResult<T = any> {
  total: number
  rows: T[]
  code?: number
  msg?: string
}

// 分页请求参数
export interface PageQuery {
  pageNum?: number
  pageSize?: number
  orderByColumn?: string
  isAsc?: 'ascending' | 'descending'
}

// 登录响应兼容类型（支持旧版和新版）
export type LoginRaw = {
  code: number
  msg: string
  token?: string
  data?: {
    token?: string
    user?: any
  }
}

// Token提取函数
export function extractToken(resp: LoginRaw): string | undefined {
  return resp.token ?? resp.data?.token
}

// 通用ID类型
export type ID = string | number

// 通用状态枚举
export enum Status {
  ENABLE = '0',
  DISABLE = '1'
}

// 通用删除标志
export enum DelFlag {
  NORMAL = '0',
  DELETED = '2'
}

// 时间范围查询
export interface DateRange {
  beginTime?: string
  endTime?: string
}

// 通用树形结构
export interface TreeNode<T = any> {
  id: ID
  label: string
  children?: TreeNode<T>[]
  data?: T
}

// 通用下拉选项
export interface SelectOption<T = string> {
  label: string
  value: T
  disabled?: boolean
}

// 字典数据类型
export interface DictData {
  dictCode: number
  dictSort: number
  dictLabel: string
  dictValue: string
  dictType: string
  cssClass?: string
  listClass?: string
  isDefault?: string
  status: Status
  createBy?: string
  createTime?: string
  updateBy?: string
  updateTime?: string
  remark?: string
}

// 文件上传响应
export interface UploadResult {
  fileName: string
  url: string
  originalName?: string
  size?: number
}

// 导出请求参数
export interface ExportQuery extends PageQuery {
  exportColumns?: string[]
  fileName?: string
}

// 批量操作请求
export interface BatchRequest<T = ID> {
  ids: T[]
  [key: string]: any
}

// 操作日志
export interface OperLog {
  operId: number
  title: string
  businessType: number
  method: string
  requestMethod: string
  operatorType: number
  operName: string
  deptName?: string
  operUrl: string
  operIp: string
  operLocation?: string
  operParam?: string
  jsonResult?: string
  status: number
  errorMsg?: string
  operTime: string
}
