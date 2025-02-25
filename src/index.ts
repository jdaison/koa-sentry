import './instrument';
import * as Sentry from '@sentry/node';
import Koa from 'koa';
import { findProducts } from './productService';

const app = new Koa();

Sentry.setupKoaErrorHandler(app);

app.use(async (ctx: Koa.Context) => {
    console.log("Request received", ctx.path);

    if (ctx.path === "/error") {
        console.log("This is a test error");
        throw new Error("This is a test error");
    }
    const products = await findProducts();
    ctx.body = `Products: ${JSON.stringify(products)} | Hello World ${new Date().toISOString()}`;
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});