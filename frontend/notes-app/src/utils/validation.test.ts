import { validateEmail, validatePassword, validateName } from './validation'

describe('validateEmail', () => {

    it('returns error when email is empty', () => {
        expect(validateEmail('')).toBe('Email is required')
    })

    it('returns error for bad email', () => {
        expect(validateEmail('not-an-email')).toBe('Enter a valid email address')
    })

    it('returns error when email has internal whitespace', () => {
        expect(validateEmail('a b@example.com')).toBe('Enter a valid email address')
        expect(validateEmail('a@ex ample.com')).toBe('Enter a valid email address')
    })

    it('returns null for a valid email', () => {
        expect(validateEmail('sara@gmail.com')).toBeNull()
    })

})

describe('validatePassword', () => {

    it('returns error when password is empty', () => {
        expect(validatePassword('')).toBe('Password is required')
    })

    it('returns error when password is too short', () => {
        expect(validatePassword('abc1')).toBe('Password must be at least 8 characters')
    })

    it('returns null for a valid password', () => {
        expect(validatePassword('password123')).toBeNull()
    })

})

describe('validateName', () => {

    it('returns error when name is empty', () => {
        expect(validateName('')).toBe('Name is required')
    })

    it('returns error when name is too short', () => {
        expect(validateName('A')).toBe('Name must be at least 2 characters')
    })

    it('returns null for a valid name', () => {
        expect(validateName('Sara')).toBeNull()
    })

})
