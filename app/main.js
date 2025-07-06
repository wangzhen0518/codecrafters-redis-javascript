const net = require("net");

class Redis {
    constructor() {
        this.libName = "";
        this.libVer = "";
    }
}

const redis = new Redis();

// TODO 实现完整的 parser
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

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function lowercaseFirstLetter(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
}

function formatKeyName(attrName) {
    let attrNameList = attrName.split("-").map(s => capitalizeFirstLetter(s.toLowerCase()));
    return lowercaseFirstLetter(attrNameList.join(""));
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
            case "client": {
                switch (commandList[1].toLowerCase()) {
                    case "info": {
                        let resp =
                            "id=10 addr=127.0.0.1:39422 laddr=127.0.0.1:6379 fd=24 name= age=0 idle=0 flags=N db=0 sub=0 psub=0 ssub=0 multi=-1 watch=0 qbuf=26 qbuf-free=20448 argv-mem=10 multi-mem=0 rbs=16384 rbp=16384 obl=0 oll=0 omem=0 tot-mem=37786 events=r cmd=client|info user=default redir=-1 resp=2 lib-name= lib-ver= io-thread=0\n";
                        resp = encodeStringResponse(resp);
                        connection.write(resp);
                        break;
                    }
                    case "setinfo": {
                        for (let index = 2; index < commandList.length; index += 2) {
                            const attrName = formatKeyName(commandList[index]);
                            const attrValue = commandList[index + 1];
                            redis[attrName] = attrValue;
                        }
                        let resp = encodeStatusResponse("OK");
                        connection.write(resp);
                        break;
                    }
                    default:
                        break;
                }
                break;
            }
            default:
                break;
        }
    });
});

server.listen(6379, "127.0.0.1");
