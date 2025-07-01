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
    let encodedString;
    if (stringResponse.length > 0) {
        encodedString = `\$${stringResponse.length}\r\n${stringResponse}\r\n`;
    } else {
        encodedString = "$-1\r\n";
    }
    return encodedString;
}

function setKeyExpire(key, time) {
    setTimeout(() => {
        database.delete(key);
    }, time);
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
                let key = commandList[1];
                let value = commandList[2];
                database.set(key, value);
                if (commandList.length >= 5 && commandList[3].toLowerCase() === "px") {
                    let timeout = Number.parseInt(commandList[4]);
                    setKeyExpire(key, timeout);
                }
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
