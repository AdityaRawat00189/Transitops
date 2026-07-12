import { Server } from "socket.io";
import locationSocket from "../sockets/location-sockets.js";

let ioInstance;

export const configureSockets = (server) => {
    // Set up CORS security with trimmed origin and credentials
    ioInstance = new Server(server, {
        cors: {
            origin: function(origin, callback) { callback(null, true); }, 
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    locationSocket(ioInstance);

    return ioInstance;
};

export const getIO = () => ioInstance;