$ErrorActionPreference = 'Stop'

$path = 'frontend/src/views/business/inspection/detail.vue'
$enc = New-Object System.Text.UTF8Encoding($false)
$text = [System.IO.File]::ReadAllText($path)
$original = $text

# 1) Handling suggestion default text
$text = [regex]::Replace($text, 'return\s+item\.suggestion\s*\|\|\s*\'[^\']*\'', 'return item.suggestion || ''请根据设备手册进行处理''')

# 2) Success message unify
$text = [regex]::Replace($text, 'proxy\.\$modal\.msgSuccess\(`[^`]*\`\)', 'proxy.$modal.msgSuccess(`已生成 ${resp.data.length} 个工单`)')

if ($text -ne $original) {
  [System.IO.File]::WriteAllText($path, $text, $enc)
  Write-Output 'OK'
} else {
  Write-Output 'NOCHANGE'
}

