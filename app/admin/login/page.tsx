"use client";

import { Suspense } from "react";
import LoginForm from "@/components/ui/login-form";

function LoginFormWrapper() {
  return <LoginForm />;
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <LoginFormWrapper />
    </Suspense>
  );
}

