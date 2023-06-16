import { faker } from '@faker-js/faker'
import { Express } from 'express-serve-static-core'
import request from 'supertest'

import UserService from '@exmpl/api/services/user'
import { createServer } from '@exmpl/utils/server'

jest.mock('@exmpl/api/services/user')

let server: Express

beforeAll(async () => {
  server = await createServer()
})

describe('auth failure', () => {
  it('should return 500 & valid response if auth rejects with an error', async () => {
    ;(UserService.auth as jest.Mock).mockRejectedValue(new Error())
    try {
      const res = await request(server).get(`/api/v1/goodbye`).set('Authorization', 'Bearer fakeToken').expect(500)
      expect(res.body).toMatchObject({ error: { type: 'internal_server_error', message: 'Internal Server Error' } })
    } catch (err) {
      expect(err).toBeNull()
    }
  })
})

describe('createUser failure', () => {
  it('should return 500 & valid response if auth rejects with an error', async () => {
    ;(UserService.createUser as jest.Mock).mockRejectedValue({ error: { type: 'unknown' } })
    try {
      const res = await request(server)
        .post(`/api/v1/user`)
        .send({
          email: faker.internet.email(),
          password: faker.internet.password(),
          name: faker.person.firstName(),
        })
        .expect(500)
      expect(res.body).toMatchObject({ error: { type: 'internal_server_error', message: 'Internal Server Error' } })
    } catch (err) {
      expect(err).toBeNull()
    }
  })
})
