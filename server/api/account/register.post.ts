import { defineEventHandlerContext, HandlerFunc } from '~/server/utils/context'

const register: HandlerFunc = async (c) => {
  const body = await c.GetBody()
  const { username, password, name } = body as {
    username: string
    password: string
    name: string
  }

  const user = await c.GetPrisma().user.create({
    data: {
      username,
      password,
      name,
    },
  })

  c.ResultSuccessData(user)
}

export default defineEventHandlerContext(register)
