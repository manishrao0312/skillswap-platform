const { Message } = require('../models');

const onlineUsers = new Map();

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`🔌 User connected: ${socket.id}`);

        // User joins with their userId
        socket.on('user:online', (userId) => {
            onlineUsers.set(userId, socket.id);
            socket.userId = userId;
            io.emit('user:status', { userId, isOnline: true });
            console.log(`👤 User ${userId} is online`);
        });

        // Real-time chat messaging
        socket.on('message:send', async (data) => {
            try {
                const { senderId, receiverId, content, type = 'text' } = data;

                // Persist to PostgreSQL
                const message = await Message.create({
                    senderId, receiverId, content, type
                });

                const messageData = {
                    id: message.id,
                    senderId,
                    receiverId,
                    content,
                    type,
                    createdAt: message.createdAt,
                    isRead: false
                };

                // Send to receiver if online
                const receiverSocketId = onlineUsers.get(receiverId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('message:receive', messageData);
                }

                // Confirm to sender
                socket.emit('message:sent', messageData);
            } catch (error) {
                socket.emit('message:error', { error: error.message });
            }
        });

        // Typing indicator
        socket.on('typing:start', ({ senderId, receiverId }) => {
            const receiverSocketId = onlineUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('typing:start', { senderId });
            }
        });

        socket.on('typing:stop', ({ senderId, receiverId }) => {
            const receiverSocketId = onlineUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('typing:stop', { senderId });
            }
        });

        // Mark messages as read
        socket.on('message:read', async ({ senderId, receiverId }) => {
            try {
                await Message.update(
                    { isRead: true, readAt: new Date() },
                    { where: { senderId, receiverId, isRead: false } }
                );
                const senderSocketId = onlineUsers.get(senderId);
                if (senderSocketId) {
                    io.to(senderSocketId).emit('message:read', { readBy: receiverId });
                }
            } catch (error) {
                console.error('Read receipt error:', error);
            }
        });

        // === WebRTC Signaling ===

        // Join a video room
        socket.on('webrtc:join', ({ roomId, userId }) => {
            socket.join(roomId);
            socket.roomId = roomId;
            socket.to(roomId).emit('webrtc:user-joined', { userId, socketId: socket.id });
            console.log(`📹 User ${userId} joined room ${roomId}`);
        });

        // WebRTC offer
        socket.on('webrtc:offer', ({ offer, roomId, to }) => {
            socket.to(to || roomId).emit('webrtc:offer', {
                offer,
                from: socket.id,
                userId: socket.userId
            });
        });

        // WebRTC answer
        socket.on('webrtc:answer', ({ answer, to }) => {
            io.to(to).emit('webrtc:answer', {
                answer,
                from: socket.id
            });
        });

        // ICE candidate exchange
        socket.on('webrtc:ice-candidate', ({ candidate, to, roomId }) => {
            if (to) {
                io.to(to).emit('webrtc:ice-candidate', { candidate, from: socket.id });
            } else {
                socket.to(roomId).emit('webrtc:ice-candidate', { candidate, from: socket.id });
            }
        });

        // Leave video room
        socket.on('webrtc:leave', ({ roomId, userId }) => {
            socket.leave(roomId);
            socket.to(roomId).emit('webrtc:user-left', { userId, socketId: socket.id });
        });

        // Screen share toggle
        socket.on('webrtc:screen-share', ({ roomId, isSharing }) => {
            socket.to(roomId).emit('webrtc:screen-share', {
                userId: socket.userId,
                isSharing
            });
        });

        // Disconnect
        socket.on('disconnect', () => {
            if (socket.userId) {
                onlineUsers.delete(socket.userId);
                io.emit('user:status', { userId: socket.userId, isOnline: false });
            }
            if (socket.roomId) {
                socket.to(socket.roomId).emit('webrtc:user-left', {
                    userId: socket.userId,
                    socketId: socket.id
                });
            }
            console.log(`🔌 User disconnected: ${socket.id}`);
        });
    });
};
