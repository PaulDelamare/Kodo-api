import WebSocket from 'ws';
import jwt from 'jsonwebtoken';
import { parseWebSocketMessage } from './Utils/parseWebsocketMessage/parseWebsocketMessage';

const serverWs = new WebSocket.Server({ port: 7000 });

const rooms: { [key: string]: WebSocket[] } = {};

// Fonction de heartbeat qui sera appelée lors du pong
function heartbeat(this: WebSocket) {
    (this as any).isAlive = true;
}

serverWs.on('connection', (ws, request) => {
    console.log('🔌 Client WebSocket connecté');

    (ws as any).isAlive = true;
    ws.on('pong', heartbeat);

    const token = request.headers['sec-websocket-protocol'];

    jwt.verify(token as string, process.env.JWT_SECRET as string, async (err, decoded) => {
        if (err) {
            console.log('⚠️ Erreur d\'authentification WebSocket:', err);
            ws.close();
            return;
        }

        console.log('🔑 Authentification réussie pour:', decoded);

        let joinedRoom: string | null = null;

        ws.on('message', (data) => {
            const message = parseWebSocketMessage(data);
            if (!message) return;

            if (message.action === 'join' && message.id) {
                joinedRoom = message.id.toString();

                if (!rooms[joinedRoom]) {
                    rooms[joinedRoom] = [];
                }
                rooms[joinedRoom].push(ws);
                console.log(`👥 Client ajouté au salon du marchand ${joinedRoom}`);
            }
        });

        ws.on('close', () => {
            if (joinedRoom) {
                rooms[joinedRoom] = rooms[joinedRoom].filter(client => client !== ws);
                console.log(`❌ Client retiré du salon ${joinedRoom}`);
            }
        });

        ws.on('error', (error) => {
            console.log('⚠️ Erreur WebSocket:', error);
        });
    });
});

// Mécanisme de ping pong permettant de maintenir la connexion active
const interval = setInterval(() => {
    serverWs.clients.forEach((ws) => {

        if ((ws as any).isAlive === false) {
            console.log('❌ Terminaison d\'une connexion inactive');
            return ws.terminate();
        }

        (ws as any).isAlive = false;
        ws.ping(() => { });
    });
}, 30000);

serverWs.on('close', () => {
    clearInterval(interval);
});

export function sendToRoom(id: string, message: string) {
    const clientsInRoom = rooms[id] || [];
    clientsInRoom.forEach(client => {
        client.send(JSON.stringify({
            event: 'newMessage',
            message: message
        }));
    });
}

setTimeout(() => {
    console.log('message envoyé')
    sendToRoom('e6160e4d-9058-4375-978e-cff74f30e625', JSON.stringify({ message: 'salut' }));
}, 10000);

export default serverWs;
