const axios = require('axios')

const CONCURRENCY = parseInt(process.env.CONCURRENCY || '0')

const client = axios.create({
  timeout: 10000,
});

const servers = [
  {
    tag: 'normal',
    url: `http://localhost:8080/test`
  },
  {
    tag: '1-mock-vue-ssr-worker',
    url: `http://localhost:8081/test`
  },
  {
    tag: 'pool-1-mock-vue-ssr-workers',
    url: `http://localhost:8082/test`
  },
  {
    tag: 'pool-n-mock-vue-ssr-workers',
    url: `http://localhost:8083/test`
  }
]

const results = {}

function toMs (hrend) {
  const left = hrend[0] * 1000
  const right = hrend[1] / 1000000
  return left + right
}

function loadTest(loadTestId, url) {
  const result = results[url]

  return new Promise((resolve) => {
    for (let n = 0; n < CONCURRENCY; n++) {
      const hrstart = process.hrtime()
      const requestId = `${loadTestId}-${n}`
      console.log({requestId, hrstart})
      client.get(`${url}?requestId=${n}`)
        .then((res) => {
          const hrend = process.hrtime(hrstart)
          console.log({
            requestId,
            hrend,
            duration: `${hrend[0]} ${hrend[1] / 1000000}`
          })
          result.success += 1
          result.sumDuration += toMs(hrend)
        })
        .catch(() => {
          result.fail += 1
        })
        .finally(() => {
          if (result.success + result.fail === CONCURRENCY) {
            resolve()
          }
        })
    }
  })
}

async function main () {
  const loadTestPromises = []

  for (let index in servers) {
    const url = servers[index].url
    results[url] = {
      success: 0,
      fail: 0,
      sumDuration: 0
    }
    loadTestPromises.push(loadTest(index, url))
  }

  await Promise.all(loadTestPromises)

  console.log('=== RESULT ===')

  console.log({
    CONCURRENCY
  })

  for (let server of servers) {
    const { tag, url } = server
    const { success, fail, sumDuration } = results[url]
    console.log({
      tag,
      url,
      success: `${success} (${ (success * 100 / CONCURRENCY).toFixed(2) }%)`,
      fail,
      averageDuration: sumDuration / success
    })
  }
}

main()
