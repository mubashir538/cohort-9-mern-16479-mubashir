export function validateEmail(value: string): string | null {
    const trimmed = value.trim()

    if (trimmed.length === 0) {
        return 'Email is required'
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

    if (!emailPattern.test(trimmed)) {
        return 'Enter a valid email address'
    }

    return null
}

export function validatePassword(value: string): string | null {
    if (value.length === 0) {
        return 'Password is required'
    }
    if (value.length < 8) {
        return 'Password must be at least 8 characters'
    }

    const hasLetter = /[a-zA-Z]/.test(value)
    const hasNumber = /[0-9]/.test(value)
    if (!hasLetter || !hasNumber) {
        return 'Password must contain at least one letter and one number'
    }

    return null
}

export function validateName(value: string): string | null {
    const trimmed = value.trim()
    if (trimmed.length === 0) {
        return 'Name is required'
    }

    if (trimmed.length < 2) {
        return 'Name must be at least 2 characters'
    }
    return null
}