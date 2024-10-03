import { SignJWT, jwtVerify } from 'jose'

const alg = 'HS256'

const issuer = 'Wuchieh'
const audience = 'user'

const sign = (() => {
  const secret = new TextEncoder().encode(useRuntimeConfig().secret)
  return async (data: { [k: string]: any }) => {
    return await new SignJWT(data)
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setIssuer(issuer)
      .setAudience(audience)
      .setExpirationTime('2h')
      .sign(secret)
  }
})()

const decrypt = (() => {
  const secret = new TextEncoder().encode(useRuntimeConfig().secret)
  return async (token: string) => {
    const { payload } = await jwtVerify(token, secret, {
      issuer,
      audience,
    })
    return payload
  }
})()

export { sign, decrypt }
