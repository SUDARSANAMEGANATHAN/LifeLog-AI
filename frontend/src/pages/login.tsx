// frontend/src/pages/login.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function LoginRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Immediately send user to the main LifeLog page
    router.replace("/");
  }, [router]);

  // Nothing to render, it's just a redirect
  return null;
}
