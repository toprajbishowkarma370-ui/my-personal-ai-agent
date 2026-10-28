'use client';

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function LoginContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const handleGoogleSignIn = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    signIn("google", { callbackUrl: "/dashboard" }, { prompt: "select_account" });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#10172e", color: "#fff", padding: "20px" }}>
      <div style={{ maxWidth: "420px", width: "100%", background: "#1a223f", padding: "40px", borderRadius: "20px", border: "1px solid #2b3563", boxShadow: "0 20px 40px rgba(0,0,0,0.4)", textAlign: "center" }}>
        <div style={{ width: "56px", height: "56px", margin: "0 auto 20px", borderRadius: "16px", background: "linear-gradient(135deg, #8e7dff, #35cce2)", display: "grid", placeItems: "center", fontWeight: "bold", fontSize: "24px", color: "#10172e" }}>
          AI
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px", letterSpacing: "-0.5px" }}>My Personal AI Business Agent</h1>
        <p style={{ color: "#9da6c7", fontSize: "14px", marginBottom: "32px" }}>Owner Access Portal • Secure Authentication</p>

        {error && (
          <div style={{ marginBottom: "20px", padding: "12px", background: "rgba(216, 88, 101, 0.15)", border: "1px solid #d85865", borderRadius: "10px", color: "#ff8b95", fontSize: "13px" }}>
            {error === "AccessDenied" 
              ? "Access Denied: The Google account selected is not authorized. Please sign in with the owner email (toprajbk81@gmail.com)." 
              : error === "OAuthCallback" || error === "Callback"
              ? "OAuth State/Callback Error: Please verify that NEXTAUTH_URL on Render matches your exact https:// app URL and NEXTAUTH_SECRET is configured."
              : "Authentication error occurred. Please try again."}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", background: "#ffffff", color: "#111827", border: "0", borderRadius: "12px", padding: "14px", fontWeight: "600", fontSize: "15px", cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.7 : 1, transition: "background 0.2s" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.19v3.15C3.17 21.36 7.24 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.19C.43 8.1 0 9.8 0 12s.43 3.9 1.19 5.42l4.09-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.24 0 3.17 2.64 1.19 6.58l4.09 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          {isSubmitting ? "Connecting to Google..." : "Continue with Google (Owner)"}
        </button>

        <p style={{ marginTop: "24px", color: "#68738a", fontSize: "12px" }}>
          Protected by NextAuth & secure Google OAuth. Unauthorized accounts will be blocked.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#10172e", color: "#fff", display: "grid", placeItems: "center" }}>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
