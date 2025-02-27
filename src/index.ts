import './instrument';
import * as Sentry from '@sentry/node';
import Koa from 'koa';
import Router from '@koa/router';
import { findProduct, findProducts } from './productService';

const app = new Koa();
const router = new Router();

// Set up Sentry error handler
Sentry.setupKoaErrorHandler(app);

// Define routes
router.get('/', async (ctx) => {
  ctx.body = `API is running ${new Date().toISOString()}`;
});

router.get('/products', async (ctx) => {
  const products = await findProducts();
  ctx.body = { products };
});

router.get('/product/:id', async (ctx) => {
  const product = await findProduct(ctx.params.id);
  ctx.body = { product };
});

router.get('/error', async () => {
  console.log("This is a test error");
  throw new Error("This is a test error");
});

// Register middleware
app.use(async (ctx, next) => {
  console.log(`Request received: ${ctx.method} ${ctx.path}`);
  await next();
});

// Register router
app.use(router.routes());
app.use(router.allowedMethods());

// Start the server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});