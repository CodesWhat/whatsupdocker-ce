import express from 'express';
import { getAgents, getAgent } from '../agent/index.js';

const router = express.Router();

function getAgentsList(req, res) {
    const agents = getAgents();
    const safeAgents = agents.map((agent) => ({
        name: agent.name,
        host: agent.config.host,
        port: agent.config.port,
        connected: agent.isConnected,
    }));
    res.json(safeAgents);
}

async function getAgentLogEntries(req, res) {
    const agent = getAgent(req.params.name);
    if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
    }
    if (!agent.isConnected) {
        return res.status(503).json({ error: 'Agent is not connected' });
    }
    try {
        const level = req.query.level as string | undefined;
        const component = req.query.component as string | undefined;
        const tail = req.query.tail ? parseInt(req.query.tail as string, 10) : undefined;
        const since = req.query.since ? parseInt(req.query.since as string, 10) : undefined;
        const entries = await agent.getLogEntries({ level, component, tail, since });
        res.json(entries);
    } catch (e: any) {
        res.status(502).json({ error: `Failed to fetch logs from agent: ${e.message}` });
    }
}

export function init() {
    router.get('/', getAgentsList);
    router.get('/:name/log/entries', getAgentLogEntries);
    return router;
}
