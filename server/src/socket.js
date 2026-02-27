const { Server } = require('socket.io');
const store = require('./store/memory');

function attach(server, origin) {
  const io = new Server(server, {
    cors: {
      origin,
      methods: ['GET', 'POST', 'PATCH'],
      credentials: true,
    },
  });

  // broadcast metrics every 5 seconds
  const tick = async () => {
    try {
      const next = await store.tickMetrics();
      io.emit('metrics:tick', next);
    } catch (e) {
      console.error('tick error', e);
    }
  };
  // initial tick to populate metrics from DB
  tick();
  setInterval(tick, 5000);

  io.on('connection', (socket) => {
    socket.emit('metrics:bootstrap', {
      summary: store.getSummary(),
      timeseries: store.getTimeseries(),
    });
  });

  return io;
}

module.exports = { attach };
