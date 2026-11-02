import { describe, expect, it } from 'vitest'
import { fuelValueEur, formatEur, formatFuel, formatPol, formatUnitsFixed, numberToPrice, parseAmount, priceToNumber, shortAddress } from './price'

describe('price helpers', () => {
  it('formats EUR', () => {
    expect(formatEur(1.989, 'en-US', 3)).toBe('€1.989')
    expect(formatEur(NaN)).toBe('-')
  })
  it('formats FUEL with 3 decimals, truncating', () => {
    expect(formatFuel(75414781297134238n, 'en-US')).toBe('0.075')
    expect(formatFuel(1999999999999999999n, 'en-US')).toBe('1.999')
    expect(formatFuel(2.5, 'en-US')).toBe('2.500')
  })
  it('shows tiny FUEL amounts as below one thousandth, not zero', () => {
    expect(formatFuel(408n * 10n ** 12n, 'en-US')).toBe('< 0.001')
    expect(formatFuel(0n, 'en-US')).toBe('0.000')
  })
  it('formats POL with the locale separator', () => {
    expect(formatPol(1366500000000000000n, 'it-IT')).toBe('1,3665')
    expect(formatPol(1366500000000000000n, 'en-US')).toBe('1.3665')
    expect(formatPol(49007535832143033n, 'it-IT', 6)).toBe('0,049007')
  })
  it('truncates unit strings', () => {
    expect(formatUnitsFixed(1234567n, 6, 2)).toBe('1.23')
    expect(formatUnitsFixed(5n * 10n ** 18n, 18, 3)).toBe('5.000')
  })
  it('parses amounts with 18 and 6 decimals', () => {
    expect(parseAmount('1.5', 18)).toBe(1500000000000000000n)
    expect(parseAmount('1,5', 6)).toBe(1500000n)
    expect(parseAmount('0', 18)).toBeNull()
    expect(parseAmount('abc', 18)).toBeNull()
    expect(parseAmount('', 18)).toBeNull()
  })
  it('converts 6-decimal prices', () => {
    expect(priceToNumber(1989000n)).toBe(1.989)
    expect(numberToPrice(1.989)).toBe(1989000n)
  })
  it('values a balance in EUR', () => {
    expect(fuelValueEur(2n * 10n ** 18n, 1.989)).toBeCloseTo(3.978, 6)
  })
  it('shortens addresses', () => {
    expect(shortAddress('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')).toBe('0xf39F...2266')
  })
})
