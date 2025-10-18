import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Deterministic numeric seed from two strings. Stable across sessions.
export function hashToSeed(a: string, b: string): number {
  const input = `${a}|${b}`
  let h = 2166136261 >>> 0 // FNV-1a 32-bit offset
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  // keep within signed 31-bit range many generators expect
  return h & 0x7fffffff
}
