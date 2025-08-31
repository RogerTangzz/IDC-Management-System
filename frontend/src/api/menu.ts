/// <reference path="../types/entities.d.ts" />
/// <reference path="../types/global.d.ts" />
/** 菜单与动态路由获取 */
import request from '@/utils/request'

// 临时补充：后续应统一放入类型声明文件
export interface ApiResult<T = any> { code: number; msg: string; data: T }
export interface MenuRouteNode { path: string; component?: string; children?: MenuRouteNode[]; meta?: any }


/**
 * 获取当前用户的动态路由（菜单）结构
 * @returns Promise<ApiResult<MenuRouteNode[]>>
 */
export function getRouters(): Promise<ApiResult<MenuRouteNode[]>> {
    return request({ url: '/getRouters', method: 'get' }) as Promise<ApiResult<MenuRouteNode[]>>
}
