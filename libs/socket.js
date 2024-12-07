module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected: " + socket.id);

    socket.on("sendMessage", (messageData) => {
      console.log("Message received: ", messageData);

      io.emit("newMessage", messageData);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected: " + socket.id);
    });
  });
};
