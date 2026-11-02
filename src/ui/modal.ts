import type { KeyboardEvent } from 'react';

export function trapModalTab(event: KeyboardEvent<HTMLElement>) {
  if (event.key !== 'Tab') return;
  const nodes = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled):not([tabindex="-1"]), a[href], select, [tabindex="0"]')];
  const first = nodes[0], last = nodes.at(-1);
  if (!first || !last) { event.preventDefault(); return; }
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}
