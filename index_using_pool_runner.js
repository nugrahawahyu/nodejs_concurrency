const axios = require('axios')
const express = require('express')
const Pool = require('./pool')
const { sleep, logger, mockLog } = require('./utils')
const mockApiResponse = require('./mock_api_response')

const DISABLE_MOCK_API_CALL = process.env.DISABLE_MOCK_API_CALL === 'true'
const TOTAL_RUNNERS = parseInt(process.env.TOTAL_RUNNERS || '2')

let Pooler = new Pool(`${__dirname}/mock_vue_ssr_runner.js`, parseInt(TOTAL_RUNNERS));

const app = express()

async function mockApiCall () {
  for (let i = 0; i < 5; i++) {
    await axios.get('http://localhost:8080/mock-api')
  }
}

function mockVueSSR (requestId) {
  return new Promise((resolve) => {
    const num = 30
    const eventName = `mock-vue-ssr-${requestId}`
    Pooler.assignWork({num: num, event: eventName}, (msg) => {
      resolve(msg.value)
    })
  })
}

app.get('/test', async (req, res) => {
  const requestId = req.query.requestId
  await mockLog(requestId)
  logger.info({ requestId, message: 'START' })
  if (!DISABLE_MOCK_API_CALL) {
    logger.info({ requestId, message: 'API_CALL START' })
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
  console.log(`server is running at http://0.0.0.0:8080. total child process worker: ${TOTAL_RUNNERS}`)
})

