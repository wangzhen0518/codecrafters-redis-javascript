const net = require("net");

const server = net.createServer(connection => {
    // Handle connection
    console.log("connection :>> ", connection);
    connection.write("+PONG\r\n");
});

server.listen(6379, "127.0.0.1");
