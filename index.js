const axios = require('axios')
const express = require('express')
const { sleep, logger, mockLog } = require('./utils')
const mockApiResponse = require('./mock_api_response')

const DISABLE_MOCK_API_CALL = process.env.DISABLE_MOCK_API_CALL === 'true'

const app = express()

async function mockApiCall () {
  for (let i = 0; i < 5; i++) {
    await axios.get('http://localhost:8080/mock-api')
  }
}

async function mockVueSSR () {
  const DEPTH = 30
  function mockPerformVueSSR (n) {
    if (n < 2) {
      return 1;
    }
    return mockPerformVueSSR(n - 2) + mockPerformVueSSR(n - 1);
  }
  return mockPerformVueSSR(DEPTH)
}

app.get('/test', async (req, res) => {
  const requestId = req.query.requestId
  await mockLog(requestId)
  logger.info({ requestId, message: 'START' })
  if (!DISABLE_MOCK_API_CALL) {
    await mockApiCall(requestId)
    logger.info({ requestId, message: 'API_CALL DONE' })
  }
  logger.info({ requestId, message: 'MOCK_VUE_SSR START' })
  const result = await mockVueSSR(requestId)
  logger.info({ requestId, message: 'MOCK_VUE_SSR DONE' })
  res.json({result})
  logger.info({ requestId, message: 'RES SENT' })
})

app.get('/mock-api', async (req, res) => {
  await sleep(200)
  res.json(mockApiResponse)
})

app.listen(8080, () => {
  console.log(`server is running at http://0.0.0.0:8080`)
})
