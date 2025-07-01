const net = require("net");

function decodeCommand(commandString) {
    let commandList = commandString
        .toString()
        .split("\r\n")
        .filter(s => s.length > 0 && !s.startsWith("*") && !s.startsWith("$"));
    return commandList;
}

function encodeStatusResponse(stateResponse) {
    let encodedString = `+${stateResponse}\r\n`;
    return encodedString;
}
function encodeStringResponse(stringResponse) {
    let cnt = stringResponse.length > 0 ? stringResponse.length : -1;
    let encodedString = `\$${cnt}\r\n${stringResponse}\r\n`;
    return encodedString;
}

const database = new Map();

const server = net.createServer(connection => {
    // Handle connection
    connection.on("data", data => {
        let commandList = decodeCommand(data);
        switch (commandList[0].toLowerCase()) {
            case "ping": {
                let resp = encodeStatusResponse("PONG");
                connection.write(resp);
                break;
            }
            case "echo": {
                let resp = commandList.slice(1).join("\r\n");
                resp = encodeStringResponse(resp);
                connection.write(resp);
                break;
            }
            case "get": {
                let key = commandList[1];
                let value = database.has(key) ? database.get(key) : "";
                let resp = encodeStringResponse(value);
                connection.write(resp);
                break;
            }
            case "set": {
                let [key, value] = commandList.slice(1, 3);
                database.set(key, value);
                let resp = encodeStatusResponse("OK");
                connection.write(resp);
                break;
            }
            default:
                break;
        }
    });
});

server.listen(6379, "127.0.0.1");
