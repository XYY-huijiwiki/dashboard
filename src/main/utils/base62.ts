import basex from 'base-x'
const base62Raw = basex('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
const base62 = {
  encode: (text: string) => base62Raw.encode(Buffer.from(text)),
  decode: (text: string) => base62Raw.decode(text).toString()
}
export default base62
