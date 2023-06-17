import { Express } from 'express-serve-static-core'
import request from 'supertest'

import { createDummyAndAuthorize } from '@exmpl/tests/user'
import db from '@exmpl/utils/db'
import { createServer } from '@exmpl/utils/server'

let server: Express

beforeAll(async () => {
  await db.open()
  server = await createServer()
})

afterAll(async () => {
  await db.close()
})

describe('GET /hello', () => {
  it('should return 200 & valid response if request param list is empity', async () => {
    request(server)
      .get(`/api/v1/hello`)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return err
        expect(res.body).toMatchObject({ message: 'Hello, Stranger!' })
      })
  })

  it('should return 200 & valid response if name param is set', async () => {
    request(server)
      .get(`/api/v1/hello?name=Test%20Name`)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return err
        expect(res.body).toMatchObject({ message: 'Hello, Test Name!' })
      })
  })

  it('should return 400 & valid error response if name param is empty', async () => {
    request(server)
      .get(`/api/v1/hello?name=`)
      .expect('Content-Type', /json/)
      .expect(400)
      .end((err, res) => {
        if (err) return err
        expect(res.body).toMatchObject({
          error: {
            type: 'request_validation',
            message: expect.stringMatching(/Empty.*\'name\'/),
            errors: expect.anything(),
          },
        })
      })
  })
})

describe('GET /goodbye', () => {
  it('should return 200 & valid response to authorization with fakeToken request', async () => {
    const { token, userId } = await createDummyAndAuthorize()
    request(server)
      .get(`/api/v1/goodbye`)
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return err
        expect(res.body).toMatchObject({ message: `Goodbye, ${userId}!` })
      })
  })

  it('should return 401 & valid eror response to invalid authorization token', async () => {
    request(server)
      .get(`/api/v1/goodbye`)
      .set('Authorization', 'Bearer invalidFakeToken')
      .expect('Content-Type', /json/)
      .expect(401)
      .end((err, res) => {
        if (err) return err
        expect(res.body).toMatchObject({ error: { type: 'unauthorized', message: 'Authentication Failed' } })
      })
  })

  it('should return 401 & valid eror response if authorization header field is missed', async () => {
    try {
      const res = await request(server).get(`/api/v1/goodbye`).expect('Content-Type', /json/).expect(401)

      expect(res.body).toMatchObject({
        error: {
          type: 'request_validation',
          message: 'Authorization header required',
          errors: expect.anything(),
        },
      })
    } catch (err) {
      expect(err).toBeNull()
    }
  })
})
