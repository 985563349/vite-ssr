import { BrowserRouter, matchPath, Route, Routes, StaticRouter, useLocation, useParams } from 'react-router-dom';

export function getPageRoutes(importMap) {
  return (
    Object.keys(importMap)
      // Ensure that static routes have
      // precedence over the dynamic ones
      .sort((a, b) => (a > b ? -1 : 1))
      .map((path) => ({
        // Remove /src/pages and .jsx extension
        path: path
          .slice(10, -4)
          // Replace [id] with :id
          .replace(/\[(\w+)\]/, (_, m) => `:${m}`)
          // Replace '/index' with '/'
          .replace(/\/index$/, '/'),
        // The React component (default export)
        component: importMap[path].default,
        // The getServerSideProps individual export
        getServerSideProps: importMap[path].getServerSideProps,
      }))
  );
}

export function createRouter({ ctx, routes, url }) {
  const Router = import.meta.env.SSR ? StaticRouter : BrowserRouter;

  return (
    <Router location={url}>
      <Routes>
        {routes.map((route) => {
          const { path } = route;
          return <Route key={path} path={path} element={<RouteElement ctx={ctx} {...route} />} />;
        })}
      </Routes>
    </Router>
  );
}

export function RouteElement({ ctx, path, component: Component, getServerSideProps }) {
  // If running on the server...
  // See if we already have serverSideProps populated
  if (ctx) {
    if (ctx.serverSideProps) {
      return <Component {...ctx.serverSideProps} />;
    } else {
      return <Component />;
    }
  }

  // If running on the client...
  // Retrieve serverSideProps hydration if available

  let { url, props: serverSideProps } = window.__SSR_DATA__ ?? {};
  // Ensure hydration is always cleared after the first page render
  window.__SSR_DATA__ = null;

  if (getServerSideProps) {
    // First check if we have serverSideProps hydration
    if (serverSideProps && matchPath(path, url)) {
      return <Component {...serverSideProps} />;
    }

    const params = useParams();

    try {
      // If not, fetch serverSideProps
      serverSideProps = fetchWithSuspense({
        fetchKey: path,
        fetchFn: getServerSideProps,
        fetchParams: { params },
      });
      return <Component {...serverSideProps} />;
    } catch (error) {
      // If it's an actual error...
      if (error instanceof Error) {
        return <p>Error: {error.message}</p>;
      }
      // If it's just a promise (suspended state)
      throw error;
    }
  }

  return <Component />;
}

const activeLoaderMap = new Map();

function fetchWithSuspense({ fetchKey, fetchFn, fetchParams }) {
  let loader;

  if ((loader = activeLoaderMap.get(fetchKey))) {
    // Handle error, suspended state or return loaded data
    if (loader.error || loader.data?.statusCode === 500) {
      if (loader.data?.statusCode === 500) {
        throw new Error(loader.data.message);
      }
      throw loader.error;
    }

    if (loader.suspended) {
      throw loader.promise;
    }

    // Remove from activeLoaderMap now that we have data
    activeLoaderMap.delete(fetchKey);

    return loader.data;
  } else {
    loader = {
      suspended: true,
      error: null,
      data: null,
      promise: null,
    };

    loader.promise = Promise.resolve(fetchFn(fetchParams))
      .then((data) => (loader.data = data))
      .catch((error) => (loader.error = error))
      .finally(() => (loader.suspended = false));

    // Save the active suspended state to track it
    activeLoaderMap.set(fetchKey, loader);

    // Call again for handling tracked state
    return fetchWithSuspense({ fetchKey, fetchFn, fetchParams });
  }
}
