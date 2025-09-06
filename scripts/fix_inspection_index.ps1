$ErrorActionPreference = 'Stop'

$path = 'frontend/src/views/business/inspection/index.vue'
$enc = New-Object System.Text.UTF8Encoding($false)
$text = [System.IO.File]::ReadAllText($path)

$original = $text

# 1) Normalize date range picker (replace possibly broken multi-line block)
$patternDate = '(?s)<el-date-picker\s+v-model="dateRange"\s+type="daterange"[\s\S]*?/>'
$replacementDate = '<el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" />'
$text = [regex]::Replace($text, $patternDate, $replacementDate)

# 2) Suffix text for anomalyCount => 项
$text = [regex]::Replace($text, '(\{\{\s*scope\.row\.anomalyCount\s*\}\})[^\r\n]*', '$1 项')

# 3) Suffix text for ticketCount => 个
$text = [regex]::Replace($text, '(\{\{\s*scope\.row\.ticketCount\s*\}\})[^\r\n]*', '$1 个')

# 4) Tag text: 已复制
$text = [regex]::Replace($text, '(<el-tag\s+v-if=\s*"scope\.row\.isCopied\s*===\s*\'Y\'"\s+type="info">)[^<\r\n]*', '$1已复制')

# 5) Button text: 生成工单
$text = $text -replace '���ɹ���', '生成工单'

# 6) Statistic title: 异常处理率
$text = [regex]::Replace($text, '(<el-statistic\s+title=")[^"]*("\s+:value="statistics\.handleRate")', '$1异常处理率$2')

# 7) Success message: 已生成 n 个工单（统一两处旧实现文本）
$text = [regex]::Replace($text, 'proxy\.\$modal\.msgSuccess\(`[^`]*\`\)', 'proxy.$modal.msgSuccess(`已生成 ${n} 个工单`)')

if ($text -ne $original) {
  [System.IO.File]::WriteAllText($path, $text, $enc)
  Write-Output 'OK'
} else {
  Write-Output 'NOCHANGE'
}
