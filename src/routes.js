import { getPageRoutes } from './next';

export default getPageRoutes(import.meta.glob('/src/pages/**/*.jsx', { eager: true }));
