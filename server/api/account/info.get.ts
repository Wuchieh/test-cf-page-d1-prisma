import { defineEventHandlerContext, HandlerFunc } from '~/server/utils/context'
import { WResponse } from '~/utils/api'
import { decrypt } from '~/utils/jwt'

const info: HandlerFunc = async (c) => {
  const Authorization = c.Header('Authorization') as string
  const data = await decrypt(Authorization)

  const id = data['id'] as number

  const db = c.GetPrisma()
  const user = await db.user.findFirst({
    where: {
      id,
    },
  })

  if (!user) {
    c.ResultData(new WResponse(401, '無法取得資料'))
    return
  }
  c.ResultSuccessData(user)
}

export default defineEventHandlerContext(info)
