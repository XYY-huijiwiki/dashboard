import basex from "base-x";
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const base62Raw = basex(
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
);
const base62 = {
  encode: (text: string): string => base62Raw.encode(encoder.encode(text)),
  decode: (text: string): string => decoder.decode(base62Raw.decode(text)),
};
export default base62;
