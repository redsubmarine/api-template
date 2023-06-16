import { faker } from '@faker-js/faker'

import { Express } from 'express-serve-static-core'
import request from 'supertest'

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

describe('POST /api/v1/user', () => {
  it('should return 201 & valid response for valid user', async () => {
    request(server)
      .post(`/api/v1/user`)
      .send({
        email: faker.internet.email(),
        password: faker.internet.password(),
        name: faker.person.firstName(),
      })
      .expect(201)
      .end((err, res) => {
        if (err) return err
        expect(res.body).toMatchObject({
          userId: expect.stringMatching(/^[a-f0-9]{24}$/),
        })
      })
  })

  it('should return 409 & valid response for duplicate user', async () => {
    const data = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      name: faker.person.firstName(),
    }

    try {
      const res1 = await request(server).post(`/api/v1/user`).send(data).expect(201)

      const res2 = await request(server).post(`/api/v1/user`).send(data).expect(409)
      expect(res2.body).toMatchObject({
        error: {
          type: 'account_already_exists',
          message: `${data.email} already exists`,
        },
      })
    } catch (err) {
      expect(err).toBeNull()
    }
  })

  it('should return 400 & valid response for invalid user', async () => {
    try {
      const res1 = await request(server)
        .post(`/api/v1/user`)
        .send({
          mail: faker.internet.email(),
          password: faker.internet.password(),
          name: faker.person.firstName(),
        })
        .expect(400)

      expect(res1.body).toMatchObject({
        error: {
          type: 'request_validation',
          message: expect.stringMatching(/email/),
        },
      })
    } catch (err) {
      expect(err).toBeNull()
    }
  })
})
