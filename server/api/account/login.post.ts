import { defineEventHandlerContext, HandlerFunc } from '~/server/utils/context'
import { WResponse } from '~/utils/api'
import { sign } from '~/utils/jwt'

const login: HandlerFunc = async (c) => {
  const body = await c.GetBody()
  const { username, password } = body as {
    username: string
    password: string
  }

  const user = await c.GetPrisma().user.findFirst({
    where: {
      username,
      password,
    },
  })

  if (!user) {
    c.ResultData(new WResponse(400, '帳號或密碼錯誤'))
    return
  }

  const data = await sign({ id: user.id })

  c.ResultSuccessData(data)
}

export default defineEventHandlerContext(login)
