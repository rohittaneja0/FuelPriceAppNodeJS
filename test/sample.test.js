const app = require('../app.js') // Link to your server file
const supertest = require('supertest')
const request = supertest(app)

describe('API Endpoint Testing', () => {
it('gets the test endpoint', async done => {
    const response = await request.get('/login')
  
    expect(response.status).toBe(200)
    done()
  })

  it('gets the test endpoint', async done => {
    const response = await request.get('/register')
  
    expect(response.status).toBe(200)
    done()
  })

  it('gets the test endpoint', async done => {
    const response = await request.get('/quote')
  
    expect(response.status).toBe(302)
    done()
  })

  it('gets the test endpoint', async done => {
    const response = await request.get('/profileManagement')
  
    expect(response.status).toBe(302)
    done()
  })

  it('gets the test endpoint', async done => {
    const response = await request.get('/quoteHistory')
  
    expect(response.status).toBe(302)
    done()
  })
});