import { Suspense } from 'react';
import { hydrateRoot } from 'react-dom/client';

import routes from './routes';
import { createRouter } from './next';

hydrateRoot(document.getElementById('app'), <Suspense>{createRouter({ routes })}</Suspense>);
