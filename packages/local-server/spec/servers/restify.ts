// https://github.com/restify/node-restify
import * as restify from 'restify';

export = {
    node: '>= 6.9',
    description: 'Restify app',
    handler: (options?: any) => {
        const server = restify.createServer(options);

        server.get('/', (req, res, next) => {
            res.send('Hello World!');
        });

        return server;
    },
};
