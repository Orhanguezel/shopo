// shopo/client/src/Routers.jsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { publicRoutes } from "./routes/publicRoutes";
//import { adminRoutes } from "./routes/adminRoutes";

const router = createBrowserRouter(
  //[...publicRoutes, ...adminRoutes],
  [...publicRoutes],
  {
    future: {
      // v7 ile setState'ler startTransition içine alınacak → şimdiden opt-in
      v7_startTransition: true,
    },
  }
);

export default function Routers() {
  return (
    <RouterProvider
      router={router}
      future={{ v7_startTransition: true }}
    />
  );
}
