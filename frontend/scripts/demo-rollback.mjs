#!/usr/bin/env node
// Demo rollback helper: prints how to safely rollback via FeatureFlags persistence
// Note: actual flag values live in browser localStorage; this script provides guidance.

const lines = [
  'IDC Ticket Template – Safe Rollback Demo',
  '',
  'Steps (dev/stage environment):',
  '  1) Open the app in your browser.',
  "  2) In DevTools Console, run: localStorage.setItem('idc:flag:USE_TICKET_TEMPLATE_V2','0')",
  '  3) Reload the page to apply the flag rollback.',
  '  4) Verify legacy path: open dialog, submit, cancel — no errors.',
  '',
  'To enable again:',
  "  localStorage.setItem('idc:flag:USE_TICKET_TEMPLATE_V2','1'); location.reload();",
  '',
  'Preset reference (FlagPresets.ts): dev/stage default ON, prod default OFF.',
]

console.log(lines.join('\n'))

