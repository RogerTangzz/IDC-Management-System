#!/usr/bin/env node
// 扫描 API 层禁止出现 ApiResult<any> / PageResult<any> 等裸 any 泛型
// 使用: node scripts/scan-any.js  或  npm run scan:api-any
import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'

const ROOT = process.cwd()
const API_DIR = join(ROOT, 'src', 'api')
const TARGET_PATTERNS = [
    /ApiResult<\s*any\b/i,
    /PageResult<\s*any\b/i
]

/**
 * 递归列出目录文件
 * @param {string} dir
 * @returns {string[]}
 */
function listFiles(dir) {
    const entries = readdirSync(dir, { withFileTypes: true })
    const files = []
    for (const e of entries) {
        const full = join(dir, e.name)
        if (e.isDirectory()) files.push(...listFiles(full))
        else if (/\.(js|ts|vue)$/.test(e.name)) files.push(full)
    }
    return files
}

const files = listFiles(API_DIR)
let violations = 0
for (const f of files) {
    const content = readFileSync(f, 'utf8')
    for (const pat of TARGET_PATTERNS) {
        if (pat.test(content)) {
            violations++
            console.error(`[ANY-GENERIC] ${f} 匹配 ${pat}`)
        }
    }
}

if (violations > 0) {
    console.error(`\n发现 ${violations} 处裸 any 泛型，请替换为具体实体类型或合理的联合类型。`)
    process.exit(1)
} else {
    console.log('扫描通过：API 层未发现裸 any 泛型。')
}
