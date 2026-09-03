export interface HighlightColorOption {
    name: string
    hex: string
}

export const PRESET_HIGHLIGHT_COLORS: HighlightColorOption[] = [
    { name: 'Coral', hex: '#fb5743' },
    { name: 'Amber', hex: '#f5a623' },
    { name: 'Green', hex: '#22a06b' },
    { name: 'Blue', hex: '#2f93da' },
    { name: 'Lavender', hex: '#9b7ede' },
    { name: 'Pink', hex: '#f06595' },
    { name: 'Slate', hex: '#64748b' },
]

function hexToRgb(hex: string): { r: number, g: number, b: number } {
    let sanitized = hex.replace('#', '')

    if (sanitized.length === 3) {
        sanitized = sanitized.split('').map((c) => c + c).join('')
    }

    const r = Number.parseInt(sanitized.substring(0, 2), 16)
    const g = Number.parseInt(sanitized.substring(2, 4), 16)
    const b = Number.parseInt(sanitized.substring(4, 6), 16)

    return { r, g, b }
}

export function getContrastTextColor(hex: string): string {
    const { r, g, b } = hexToRgb(hex)

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

    return luminance > 0.6 ? '#171311' : '#ffffff'
}

export function isValidHexColor(value: string): boolean {
    return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)
}