const { Message, Notification } = require('../models');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);

    // user joins their own room
    socket.on('join', (userId) => {
      socket.join(userId);
    });

    // admin joins admin room
    socket.on('joinAdmin', () => {
      socket.join('admin');
    });

    // client sends message to admin
    socket.on('clientMessage', async ({ userId, text }) => {
      try {
        const msg = await Message.create({ user_id: userId, text, sender: 'client' });
        // notify admin room
        io.to('admin').emit('newMessage', { ...msg.toObject(), userId });
      } catch (err) { console.error(err); }
    });

    // admin replies to user
    socket.on('adminMessage', async ({ userId, text }) => {
      try {
        const msg = await Message.create({ user_id: userId, text, sender: 'admin' });
        // send to that user's room
        io.to(userId).emit('newMessage', msg);
        // create notification
        await Notification.create({ user_id: userId, type: 'message', text: 'New message from admin' });
        io.to(userId).emit('notification', { type: 'message', text: 'New message from admin' });
      } catch (err) { console.error(err); }
    });

    // broadcast promotion notification to all users
    socket.on('broadcastPromotion', async ({ text }) => {
      io.emit('notification', { type: 'promotion', text });
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected:', socket.id);
    });
  });
};
