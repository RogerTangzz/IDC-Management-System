#!/usr/bin/env node
// 简单扫描 dist 是否残留 mock 关键字
const { glob } = require('node:fs/promises')
const fs = require('node:fs')
const path = require('node:path')

async function main() {
  const dist = path.resolve(__dirname, '..', 'dist')
  if (!fs.existsSync(dist)) {
    console.error('[scan] dist 不存在, 请先构建')
    process.exit(1)
  }
  const files = await glob(dist.replace(/\\/g,'/') + '/static/js/*.js')
  const patterns = [/Mock\.mock\(/, /mockjs/i, /Mock拦截/]
  let hit = []
  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8')
    if (patterns.some(r => r.test(content))) {
      hit.push(path.basename(f))
    }
  }
  if (hit.length) {
    console.error('[scan] 发现 mock 残留文件:', hit.join(', '))
    process.exit(2)
  }
  console.log('[scan] ✔ 未发现 mock 相关字符串')
}
main().catch(e => { console.error(e); process.exit(1) })