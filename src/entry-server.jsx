import { Suspense } from 'react';
import { renderToString } from 'react-dom/server';
import { matchRoutes } from 'react-router-dom';

import routes from './routes';
import { createRouter } from './next';

export async function render({ ctx, url }) {
  const [router] = matchRoutes(routes, url);
  const { getServerSideProps } = router.route;

  if (getServerSideProps) {
    ctx.serverSideProps = await getServerSideProps({ params: router.params });
  }

  const html = renderToString(<Suspense>{createRouter({ ctx, routes, url })}</Suspense>);

  return { html };
}
