import fs from 'node:fs/promises';
import express from 'express';

// constants
const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 5173;
const base = process.env.BASE || '/';

// create http server
const app = express();

let vite;

if (!isProduction) {
  const { createServer } = await import('vite');

  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base,
  });

  app.use(vite.middlewares);
} else {
  // TODO:
}

app.use('*all', async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, '');

    let template;
    let render;

    if (!isProduction) {
      // Always read fresh template in development
      template = await fs.readFile('./index.html', 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      render = (await vite.ssrLoadModule('/src/entry-server.jsx')).render;
    } else {
      // TODO:
    }

    const rendered = await render(url);
    const html = template
      .replace(`<!--app-head-->`, rendered.head ?? '')
      .replace(`<!--app-html-->`, rendered.html ?? '');

    res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
  } catch (e) {
    vite.ssrFixStacktrace(e);
    console.log(e.stack);
    res.status(500).end(e.stack);
  }
});

// start http server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});