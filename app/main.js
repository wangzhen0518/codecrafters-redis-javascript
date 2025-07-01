const net = require("net");

const server = net.createServer(connection => {
    // Handle connection
    connection.on("data", data => {
        console.log(data.toString().split("\n"));
        connection.write("+PONG\r\n");
    });
});

server.listen(6379, "127.0.0.1");
