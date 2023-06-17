import { faker } from '@faker-js/faker'

import { Express } from 'express-serve-static-core'
import request from 'supertest'

import { createDummy } from '@exmpl/tests/user'
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

describe('POST /api/v1/login', () => {
  it('should return 200 & valid response for a valid login request', async () => {
    const dummy = await createDummy()
    const res = await request(server)
      .post(`/api/v1/login`)
      .send({
        email: dummy.email,
        password: dummy.password,
      })
      .expect(200)

    expect(res.header['x-expires-after']).toMatch(
      /^(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))$/
    )
    expect(res.body).toEqual({
      userId: expect.stringMatching(/^[a-f0-9]{24}$/),
      token: expect.stringMatching(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/),
    })
  })

  it('should return 404 & valid response for a non-existing user', async () => {
    const res = await request(server)
      .post(`/api/v1/login`)
      .send({
        email: faker.internet.email(),
        password: faker.internet.password(),
      })
      .expect(404)

    expect(res.body).toEqual({
      error: { type: 'invalid_credentials', message: 'Invalid Login/Password' },
    })
  })

  it('should return 400 & valid response for invalid request', async () => {
    const res = await request(server)
      .post(`/api/v1/login`)
      .send({
        email: faker.internet.password(),
        password: faker.internet.password(),
      })
      .expect(400)

    expect(res.body).toMatchObject({
      error: { type: 'request_validation', message: expect.stringMatching(/email/) },
    })
  })
})
