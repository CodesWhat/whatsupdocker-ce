import { Request, Response } from 'express';
import logger from '../../log/index.js';
import * as event from '../../event/index.js';
import { Container } from '../../model/container.js';
import { getVersion } from '../../configuration/index.js';

const log = logger.child({ component: 'agent-api-event' });

interface SseClient {
    id: number;
    res: Response;
}

// SSE Clients
let sseClients: SseClient[] = [];

/**
 * Send SSE event to all clients.
 * @param eventName
 * @param data
 */
function sendSseEvent(eventName: string, data: any) {
    const message = {
        type: eventName,
        data: data,
    };
    const payload = JSON.stringify(message);
    sseClients.forEach((client) => {
        client.res.write(`data: ${payload}\n\n`);
    });
}

/**
 * Subscribe to Events (SSE).
 */
export function subscribeEvents(req: Request, res: Response) {
    log.info(`Controller drydock with ip ${req.ip} connected.`);

    const headers = {
        'Content-Type': 'text/event-stream',
        Connection: 'keep-alive',
        'Cache-Control': 'no-cache',
    };
    res.writeHead(200, headers);

    const client: SseClient = {
        id: Date.now(),
        res,
    };
    sseClients.push(client);

    // Send Welcome / Ack
    const ackMessage = {
        type: 'dd:ack',
        data: { version: getVersion() },
    };
    client.res.write(`data: ${JSON.stringify(ackMessage)}\n\n`);

    req.on('close', () => {
        log.info(`Controller drydock with ip ${req.ip} disconnected.`);
        sseClients = sseClients.filter((c) => c.id !== client.id);
    });
}

/**
 * Initialize event listeners.
 */
export function initEvents() {
    event.registerContainerAdded((container: Container) =>
        sendSseEvent('dd:container-added', container),
    );
    event.registerContainerUpdated((container: Container) =>
        sendSseEvent('dd:container-updated', container),
    );
    event.registerContainerRemoved((container: Container) =>
        sendSseEvent('dd:container-removed', { id: container.id }),
    );
}
