import express from 'express';
import { router } from './routes.js';

const app = express();
app.use(express.json());
app.use(router);

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
    console.log(`sandbox-runner listening on port ${port}`);
});
