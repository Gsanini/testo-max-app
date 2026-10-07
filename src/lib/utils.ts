import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }
export function messageOf(error: unknown) { return error instanceof Error ? error.message : 'Não foi possível salvar. Tente novamente.' }
