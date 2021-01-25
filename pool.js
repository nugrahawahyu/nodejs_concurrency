const child = require('child_process');

class Pool {
  constructor(file, maxPool) {
    this.pool = [];
    this.active = [];
    this.waiting = [];
    this.maxPool = maxPool;
    this.callbacks = {}

    let releaseWorker = (function (worker) {
      //move the worker back to the pool array
      this.active = this.active.filter(w => worker !== w);
      this.pool.push(worker);
      //if there is work to be done, assign it
      if (this.waiting.length > 0) {
        const work = this.waiting.shift()
        this.assignWork(work.msg, work.cb)
      }
    }).bind(this);

    for (let i = 0; i < maxPool; i++) {
      let worker = child.fork(file);
      worker.on('message', (...param) => {
        this.handleOnMessage(...param);
        releaseWorker(worker)
      });
      this.pool.push(worker)

    }
  }

  assignWork(msg, cb) {
    if (this.active.length >= this.maxPool) {
      this.waiting.push({ msg, cb });
    }

    if (this.pool.length > 0) {
      let worker = this.pool.pop();
      worker.send(msg);
      this.active.push(worker)
      this.callbacks[msg.event] = cb
    }
  }
  
  handleOnMessage(msg, ...param) {
    try {
      const cb = this.callbacks[msg.event]
      cb(msg, ...param)
      delete this.callbacks[msg.event]
      console.log(this.callbacks)
    } catch (e) {
      console.log({error: msg, callbacks: this.callbacks})
      process.exit(1)
    }
  }

}

module.exports = Pool;
