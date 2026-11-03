module.exports = function(io, authService) {
  io.use((socket, next) => {
    const user = authService.getUserFromCookieHeader(socket.handshake.headers.cookie);
    if (!user) return next(new Error('Authentication required'));
    socket.data.user = user;
    next();
  });

  io.on('connection', (socket) => {
    if (socket.data.user.role === 'staff') {
      socket.join('staff_stream');
    } else {
      socket.join(`customer_${socket.data.user.id}`);
    }
  });
};