import { EventHandlerRequest, H3Event } from 'h3'
import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'
import { IncomingMessage, ServerResponse } from 'node:http'
import { WResponse } from '~/utils/api'

type HandlerFunc = (arg: Context) => any

class Context {
  Values = new Map<string, any>()
  private prisma?: PrismaClient
  readonly event: H3Event<EventHandlerRequest>
  private index = 0
  private isAbort = false
  private body?: any
  private readonly handlers: HandlerFunc[]
  private request: IncomingMessage & { originalUrl?: string }
  private response: ServerResponse<IncomingMessage>
  private result?: WResponse

  constructor(event: H3Event<EventHandlerRequest>, handlers: HandlerFunc[]) {
    this.Values = new Map()
    this.event = event
    this.handlers = handlers

    const { req, res } = event.node
    this.request = req
    this.response = res
  }

  Set(key: string, value: any) {
    this.Values.set(key, value)
  }

  Get<T = any>(key: string): T {
    return this.Values.get(key)
  }

  Header(key: string) {
    return this.request.headers[key.toLowerCase()]
  }

  GetPrisma() {
    if (!this.prisma) {
      this.prisma = new PrismaClient({
        adapter: new PrismaD1(this.event.context.cloudflare.env.DB),
      })
    }
    return this.prisma!
  }

  Redirect(code: 301 | 302, path: string) {
    this.result = new WResponse(code, '', path)
  }

  async GetBody() {
    if (!this.body) {
      this.body = await readBody(this.event)
    }
    return this.body
  }

  Abort() {
    this.isAbort = true
  }

  IsAbort() {
    return this.isAbort
  }

  ResultData(data: WResponse) {
    this.result = data
  }

  ResultSuccessData(data?: any) {
    this.result = new WResponse(200, 'success', data)
  }

  Param(key: string) {
    return getRouterParam(this.event, key)
  }

  async Next() {
    this.index++
    while (this.index < this.handlers.length) {
      if (this.IsAbort()) return
      await this.handlers[this.index](this)
      this.index++
    }
  }

  async run() {
    if (this.index >= this.handlers.length) return

    const index = this.index

    await this.handlers[this.index](this)

    if (index == this.index && !this.IsAbort()) await this.Next()

    return this.result
  }
}

const defineEventHandlerContext = (...arg: HandlerFunc[]) => {
  return defineEventHandler(async (event) => {
    const ctx = new Context(event, arg)

    try {
      const result = await ctx.run()
      if (result) {
        if (result.code >= 300 && result.code < 400) {
          await sendRedirect(event, result.data, result.code)
          return
        }
        setResponseStatus(event, result.code)
        return result
      }
    } catch (e) {
      console.error(e)
      setResponseStatus(event, 500)
      return new WResponse(500, 'unexpected error occurred')
    }

    return new WResponse(404, 'not found')
  })
}

export { defineEventHandlerContext }
export type { HandlerFunc }
