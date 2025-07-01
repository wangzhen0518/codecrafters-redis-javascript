const net = require("net");

function decodeCommand(commandString) {}

const server = net.createServer(connection => {
    // Handle connection
    connection.on("data", data => {
        let commandList = data
            .toString()
            .split("\r\n")
            .map(s => s.trim().toLowerCase())
            .filter(s => s.length > 0 && !s.startsWith("*") && !s.startsWith("$"));
        switch (commandList[0]) {
            case "ping":
                connection.write("+PONG\r\n");
                break;
            case "echo":
                let respString = commandList.slice(1).join("\r\n");
                respString = `\$${respString.length}\r\n${respString}\r\n`;
                connection.write(respString);
                break;
            default:
                break;
        }
    });
});

server.listen(6379, "127.0.0.1");
