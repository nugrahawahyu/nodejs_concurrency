const logger = {
  info ({requestId, message}) {
    console.log(JSON.stringify({ requestId, message }))
  }
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function mockLog (requestId) {
  for (let i = 0; i < 5; i++) {
    logger.info({requestId, message: i})
  }
}

module.exports = {
  logger,
  sleep,
  mockLog
}
