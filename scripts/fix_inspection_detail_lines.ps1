$ErrorActionPreference = 'Stop'

$path = 'frontend/src/views/business/inspection/detail.vue'
$enc = New-Object System.Text.UTF8Encoding($false)
$lines = Get-Content -LiteralPath $path
$changed = $false

for ($i = 0; $i -lt $lines.Length; $i++) {
  if ($lines[$i] -match '^\s*return\s+item\.suggestion\s*\|\|') {
    $lines[$i] = "  return item.suggestion || '请根据设备手册进行处理'"
    $changed = $true
  }
}

for ($i = 0; $i -lt $lines.Length; $i++) {
  if ($lines[$i] -match 'msgSuccess\(') {
    $lines[$i] = '    proxy.$modal.msgSuccess(`已生成 ${resp.data.length} 个工单`)'
    $changed = $true
  }
}

if ($changed) {
  Set-Content -LiteralPath $path -Value $lines -Encoding UTF8
  Write-Output 'OK'
} else {
  Write-Output 'NOCHANGE'
}
