const jwt = require("jsonwebtoken");
const Provider = require("../models/Provider");
const Request = require("../models/Request");
const redis = require("../config/redis");

const socketHandler = (io) => {
  // Authenticate every socket connection using the JWT
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("No token provided"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.role = decoded.role;
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.userId} (${socket.role})`);

    // Every user joins a personal room for targeted events
    socket.join(`${socket.role}_${socket.userId}`);

    // ---- PROVIDER: goes online, starts streaming location ----
    socket.on("provider-online", async () => {
      await Provider.findOneAndUpdate(
        { user: socket.userId },
        { isOnline: true },
      );
    });

    socket.on("provider-offline", async () => {
      await Provider.findOneAndUpdate(
        { user: socket.userId },
        { isOnline: false },
      );
    });

    // Replace the update-location handler with this:
socket.on('update-location', async ({ longitude, latitude }) => {
  await redis.geoadd('provider-locations', longitude, latitude, socket.userId);

  const providerProfile = await Provider.findOneAndUpdate(
    { user: socket.userId },
    { location: { type: 'Point', coordinates: [longitude, latitude] } },
    { new: true }
  );

  if (!providerProfile) return;

  const activeRequest = await Request.findOne({
    provider: providerProfile._id, // ✅ ab Provider._id use ho raha hai, User._id nahi
    status: { $in: ['matched', 'on_the_way', 'arrived'] },
  });

  if (activeRequest) {
    io.to(`customer_${activeRequest.customer}`).emit('provider-location-update', {
      requestId: activeRequest._id,
      longitude,
      latitude,
    });
  }
});

    // Also persist to MongoDB, but only every ~30s or on online/offline toggle —
    // add a simple throttle using the lastSeen timestamp, or just call this less often from the frontend.

    // ---- PROVIDER: accepts a request ----
    socket.on('accept-request', async ({ requestId }) => {
  try {
    const providerProfile = await Provider.findOne({ user: socket.userId });

    const request = await Request.findOneAndUpdate(
      { _id: requestId, status: 'pending' },
      { status: 'matched', provider: providerProfile._id },
      { new: true }
    ).populate('customer', 'name phone');

    if (!request) {
      socket.emit('request-already-taken', { requestId });
      return;
    }

    // Customer ko batao
    io.to(`customer_${request.customer._id}`).emit('request-matched', {
      requestId: request._id,
      provider: { id: providerProfile._id, userId: socket.userId },
    });

    // ⭐ YE LINE MISSING HAI — provider ko khud confirm bhejo
    socket.emit('request-matched', { requestId: request._id });

    socket.broadcast.emit('request-taken', { requestId });
  } catch (error) {
    socket.emit('error', { message: 'Failed to accept request' });
  }
});

    // ---- STATUS UPDATES (on_the_way, arrived, in_progress, completed) ----
    socket.on("update-status", async ({ requestId, status }) => {
      const request = await Request.findByIdAndUpdate(
        requestId,
        { status },
        { new: true },
      );
      if (request) {
        io.to(`customer_${request.customer}`).emit("status-update", {
          requestId,
          status,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.userId}`);
    });
  });
};

module.exports = socketHandler;
