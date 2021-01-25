function mockPerformVueSSR (n) {
  if (n < 2) {
    return 1;
  }
  return mockPerformVueSSR(n - 2) + mockPerformVueSSR(n - 1);
}

process.on('message', (msg) => {
  'use strict';
  process.send({
    value: mockPerformVueSSR(parseInt(msg.num)),
    event: msg.event
  })
});
