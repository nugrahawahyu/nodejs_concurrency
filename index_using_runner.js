const axios = require('axios')
const express = require('express')
const {fork} = require('child_process');
const { EventEmitter } = require('events');
const { sleep, logger, mockLog } = require('./utils')
const mockApiResponse = require('./mock_api_response')

const DISABLE_MOCK_API_CALL = process.env.DISABLE_MOCK_API_CALL === 'true'

const child = fork(`${__dirname}/mock_vue_ssr_runner.js`);
const event = new EventEmitter();
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
    child.send({ num, event: eventName }); 
    event.once(eventName, (value) => {
      resolve(value)
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

child.on('message', (msg) => {
  event.emit(msg.event, msg.value)
}); //emit the event event sent

app.listen(8080, () => {
  console.log(`server is running at http://0.0.0.0:8080`)
})

