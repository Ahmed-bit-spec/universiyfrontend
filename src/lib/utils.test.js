import { describe, it, expect } from 'vitest'
import { cn } from './utils.js'

describe('cn helper', () => {
    it('combines class names and removes duplicates', () => {
        expect(cn('px-4', 'text-center', 'text-center', 'font-bold')).toBe('px-4 text-center font-bold')
    })

    it('preserves falsy values safely', () => {
        expect(cn('px-4', false, undefined, 'text-blue-500')).toBe('px-4 text-blue-500')
    })
})
