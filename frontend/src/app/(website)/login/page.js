import Login from "../../../components/Auth/Login/index";

// generate seo metadata
export async function generateMetadata() {
  return {
    title: "Login",
    description: "Login",
  };
}

// main page
export default async function login() {
  return <Login />;
}
