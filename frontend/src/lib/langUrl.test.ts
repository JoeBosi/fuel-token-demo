import { describe, expect, it } from 'vitest'
import { basenameFromPath, langFromPath, stripLangPrefix, switchLangUrl } from './langUrl'

describe('language from URL', () => {
  it('reads English from the /en prefix only', () => {
    expect(langFromPath('/')).toBe('it')
    expect(langFromPath('/app')).toBe('it')
    expect(langFromPath('/en')).toBe('en')
    expect(langFromPath('/en/')).toBe('en')
    expect(langFromPath('/en/app')).toBe('en')
    expect(langFromPath('/english')).toBe('it')
  })
  it('chooses the router basename', () => {
    expect(basenameFromPath('/en/faucet')).toBe('/en')
    expect(basenameFromPath('/faucet')).toBe('/')
  })
  it('strips the prefix', () => {
    expect(stripLangPrefix('/en')).toBe('/')
    expect(stripLangPrefix('/en/app')).toBe('/app')
    expect(stripLangPrefix('/app')).toBe('/app')
  })
  it('builds the equivalent URL in the other language', () => {
    expect(switchLangUrl('/', '', '', 'en')).toBe('/en/')
    expect(switchLangUrl('/app', '?a=1', '#buy', 'en')).toBe('/en/app?a=1#buy')
    expect(switchLangUrl('/en/', '', '', 'it')).toBe('/')
    expect(switchLangUrl('/en/come-funziona', '', '', 'it')).toBe('/come-funziona')
  })
})
