// @ts-nocheck
import path from 'path';
import express from 'express';
import { resolveUiDirectory } from '../runtime/paths.js';

/**
 * Init the UI router.
 * @returns {*|Router}
 */
export function init() {
    const uiDirectory = resolveUiDirectory();
    const router = express.Router();
    router.use(express.static(uiDirectory));

    // Redirect all 404 to index.html (for vue history mode)
    router.get('/{*path}', (req, res) => {
        res.sendFile(path.join(uiDirectory, 'index.html'));
    });
    return router;
}
