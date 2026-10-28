'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#10172e", color: "#fff", font: "15px Inter, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "48px", height: "48px", margin: "0 auto 16px", borderRadius: "12px", background: "linear-gradient(135deg, #8e7dff, #35cce2)", display: "grid", placeItems: "center", fontWeight: "bold", color: "#10172e" }}>
          AI
        </div>
        <p>Loading My Personal AI Business Agent...</p>
      </div>
    </div>
  );
}
