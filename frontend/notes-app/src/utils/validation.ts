export function validateEmail(value: string): string | null {
    const trimmed = value.trim()

    if (trimmed.length === 0) {
        return 'Email is required'
    }
    if (/\s/.test(trimmed)) {
        return 'Enter a valid email address'
    }
    const atIndex = trimmed.indexOf('@')
    if (atIndex <= 0 || atIndex !== trimmed.lastIndexOf('@')) {
        return 'Enter a valid email address'
    }

    const localPart = trimmed.slice(0, atIndex)
    const domainPart = trimmed.slice(atIndex + 1)
    const dotIndex = domainPart.lastIndexOf('.')

    if (dotIndex <= 0 || dotIndex === domainPart.length - 1) {
        return 'Enter a valid email address'
    }

    const tld = domainPart.slice(dotIndex + 1)
    if (tld.length < 2) {
        return 'Enter a valid email address'
    }

    if (localPart.length === 0 || domainPart.length === 0) {
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
    const hasNumber = /\d/.test(value)
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