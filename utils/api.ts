import type { H3Event } from 'h3'
import { Prisma } from '@prisma/client'

class WResponse<T = any> {
  code: number
  message: string
  data: T

  constructor(code: number, message: string, data?: T) {
    this.code = code
    this.message = message
    this.data = data as T
  }

  public use(event: H3Event) {
    setResponseStatus(event, this.code)
    return this
  }

  static success<T>(data?: T) {
    return new WResponse<T>(200, 'success', data)
  }
}

function successResponse(data?: any) {
  return new WResponse(200, 'success', data)
}

export { WResponse, successResponse }

const handlerError = (event: H3Event, err: any) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      // 帳號已存在
      const resp = new WResponse(401, `${void 0} error`, err.code)
      if (err.meta) {
        switch (err.meta.modelName) {
          case 'Account':
            resp.message = 'account already exists'
            break
        }
      }
      return resp.use(event)
    }
    console.error('Prisma Client Error:', err)
    return new WResponse(500, 'database error', err.code).use(event)
  }
  console.error('Unexpected Error:', err)
  return new WResponse(500, 'unexpected error occurred').use(event)
}

export { handlerError }
