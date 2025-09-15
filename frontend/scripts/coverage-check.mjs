#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const CWD = process.cwd()
const COVERAGE_JSON = path.resolve(CWD, 'coverage/coverage-final.json')

const THRESHOLDS = [
  // Ticket 路径分文件门禁：分阶段抬 index.vue，确保稳步接近 P1 目标（85/90/80/85）
  { pattern: 'src/views/business/ticket/index.util.ts', lines: 95, branches: 85, functions: 95, statements: 95 },
  // Stage 3.1：index.vue 行/句 95，分支 84，函数小步抬升至 50
  { pattern: 'src/views/business/ticket/index.vue', lines: 95, branches: 84, functions: 50, statements: 95 },
  // P2：template.vue 目标门禁（Target）
  // 说明：Vitest V8 对 .vue 渲染函数的 Function 统计较保守，
  // 目标阶段对函数覆盖采用例外值 40，其余指标按 Target 执行（85/90/80）。
  { pattern: 'src/views/business/ticket/template.vue', lines: 85, branches: 80, functions: 40, statements: 90 },
  // 对 util 采用高函数门禁，确保纯逻辑高可测
  { pattern: 'src/views/business/ticket/template.util.ts', lines: 90, branches: 85, functions: 90, statements: 90 },
  { pattern: 'src/store/**', lines: 60, branches: 50, functions: 60, statements: 60 },
  { pattern: 'src/services/**', lines: 60, branches: 50, functions: 60, statements: 60 }
]

function die(msg, code = 1) { console.error(msg); process.exit(code) }
function readCoverage() {
  if (!fs.existsSync(COVERAGE_JSON)) die(`coverage-final.json not found at ${COVERAGE_JSON}.\nRun: npx vitest run --coverage`)
  return JSON.parse(fs.readFileSync(COVERAGE_JSON, 'utf8'))
}
function toPosix(p) { return p.replace(/\\/g, '/') }
function globToRegex(glob) {
  const marked = String(glob).replace(/\*\*/g, '___GLOBSTAR___').replace(/\*/g, '___GLOBWILDCARD___')
  const esc = marked.replace(/[.+^${}()|[\]\\]/g, '\\$&')
  return new RegExp('^' + esc.replace(/___GLOBSTAR___/g, '.*').replace(/___GLOBWILDCARD___/g, '[^/]*') + '$')
}
function computeFileMetrics(fileCov) {
  const s = fileCov.s || {}, f = fileCov.f || {}, b = fileCov.b || {}, l = fileCov.l || {}
  const sTot = Object.keys(s).length, sHit = Object.values(s).filter((v) => Number(v) > 0).length
  const fTot = Object.keys(f).length, fHit = Object.values(f).filter((v) => Number(v) > 0).length
  let bTot = 0, bHit = 0
  Object.values(b).forEach((arr) => { const a = Array.isArray(arr) ? arr : []; bTot += a.length; bHit += a.filter((v) => Number(v) > 0).length })
  const lTot = Object.keys(l).length, lHit = Object.values(l).filter((v) => Number(v) > 0).length
  return { statements: [sHit, sTot], functions: [fHit, fTot], branches: [bHit, bTot], lines: [lHit, lTot] }
}
function aggregate(files) {
  const sum = { statements: [0,0], functions: [0,0], branches: [0,0], lines: [0,0] }
  files.forEach((m) => ['statements','functions','branches','lines'].forEach((k) => { sum[k][0] += m[k][0]; sum[k][1] += m[k][1] }))
  const pct = {}
  for (const k of Object.keys(sum)) { const [hit, tot] = sum[k]; pct[k] = tot === 0 ? 100 : (hit / tot) * 100 }
  return pct
}
function main() {
  const data = readCoverage()
  const files = Object.keys(data)
  const rel = files.map((abs) => ({ abs, rel: toPosix(abs).split('/src/').slice(-1)[0] ? 'src/' + toPosix(abs).split('/src/').slice(-1)[0] : toPosix(abs), cov: data[abs] }))
  const failures = []
  for (const rule of THRESHOLDS) {
    const rx = globToRegex(rule.pattern)
    const matched = rel.filter((f) => rx.test(f.rel))
    if (matched.length === 0) continue
    const metrics = matched.map((f) => computeFileMetrics(f.cov))
    const pct = aggregate(metrics)
    for (const [k, thr] of [['lines', rule.lines],['branches', rule.branches],['functions', rule.functions],['statements', rule.statements]]) {
      if (thr == null) continue
      if (pct[k] + 1e-6 < Number(thr)) failures.push({ pattern: rule.pattern, metric: k, required: thr, actual: pct[k], count: matched.length })
    }
  }
  if (failures.length) {
    console.error('\nCoverage threshold check failed:')
    failures.forEach((f) => console.error(` - ${f.pattern} :: ${f.metric} ${f.actual.toFixed(2)}% < ${f.required}% (files: ${f.count})`))
    process.exit(1)
  } else {
    console.log('Coverage thresholds passed for all configured paths.')
  }
}
main()
