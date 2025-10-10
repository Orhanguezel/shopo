// client/api-manage/routerFactory.js
import { apiUrl, join } from "./config";

/** Alt patika üreticisi */
export const group = (base) => {
  const root = String(base || "").replace(/^\/+|\/+$/g, "");
  const path = (p = "") => join(root, p);
  return {
    url:   (p = "") => apiUrl(path(p)),
    list:  () => apiUrl(path()),             // GET    /base
    create:() => apiUrl(path()),             // POST   /base
    byId:  (id) => apiUrl(path(id)),         // GET/PATCH/DELETE /base/:id
    slug:  (slug) => apiUrl(path(join("slug", slug))),
    child: (seg) => group(path(seg)),
    custom:(p) => apiUrl(path(p)),
    action:(p) => apiUrl(path(p)),
  };
};

/** CRUD kısayolu */
export const rest = (base) => {
  const g = group(base);
  return {
    list:   () => g.list(),
    get:    (id) => g.byId(id),
    create: () => g.create(),
    update: (id) => g.byId(id),
    remove: (id) => g.byId(id),
    $: g, // low-level erişim
  };
};
