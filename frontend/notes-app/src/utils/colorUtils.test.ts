import { isValidHexColor, getContrastTextColor } from './colorUtils'

describe('isValidHexColor', () => {

    it('accepts a 6 digit hex code', () => {
        expect(isValidHexColor('#fb5743')).toBe(true)
    })

    it('rejects a bad color string', () => {
        expect(isValidHexColor('notahex')).toBe(false)
    })

})

describe('getContrastTextColor', () => {

    it('returns dark text on a light color', () => {
        expect(getContrastTextColor('#ffffff')).toBe('#171311')
    })

    it('returns light text on a dark color', () => {
        expect(getContrastTextColor('#171311')).toBe('#ffffff')
    })

})
