"use client";

import { cn } from "@/lib/utils";
import { useState, FormEvent, useEffect } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, sendPasswordResetEmail, fetchSignInMethodsForEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { checkAdminStatus, updateAdminUser, isAdminEmail, createOrUpdateUser } from "@/lib/auth";

interface LoginFormProps {
  className?: string;
}

export default function LoginForm({ className }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for error in URL params
  useEffect(() => {
    const errorParam = searchParams?.get("error");
    if (errorParam === "not-admin") {
      setError("You do not have admin privileges. Please contact an administrator.");
    }
  }, [searchParams]);

  // Load remembered email on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const rememberedEmail = localStorage.getItem("rememberedEmail");
      const shouldRemember = localStorage.getItem("rememberMe") === "true";
      
      if (rememberedEmail && shouldRemember) {
        setEmail(rememberedEmail);
        setRememberMe(true);
      }
    }
  }, []);

  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);

    try {
      if (!auth) {
        throw new Error("Firebase is not initialized. Please check your environment variables.");
      }

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Create or update user document for ALL users (not just admins)
      // This allows admins to see and manage all users
      await createOrUpdateUser(user);

      // Check if user is admin BEFORE allowing login
      const isAdmin = await checkAdminStatus(user);
      
      if (!isAdmin) {
        // User is not admin, sign them out immediately
        await signOut(auth);
        setError("You do not have admin privileges. Only administrators can access this system.");
        setIsLoading(false);
        return;
      }

      // User is admin - update their document with latest info
      await updateAdminUser(user);

      // Handle remember me for Google sign-in (use email from user object)
      if (typeof window !== "undefined" && user.email) {
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", user.email);
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("rememberedEmail");
          localStorage.removeItem("rememberMe");
        }
      }

      // Redirect to dashboard
      router.push("/admin");
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      if (error.code === "auth/popup-closed-by-user") {
        setError("Sign-in popup was closed. Please try again.");
      } else if (error.code === "auth/popup-blocked") {
        setError("Popup was blocked. Please allow popups and try again.");
      } else {
        setError("Failed to sign in with Google. Please try again.");
      }
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!auth) {
        throw new Error("Firebase is not initialized. Please check your environment variables.");
      }

      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // Create or update user document for ALL users (not just admins)
      // This allows admins to see and manage all users in the dashboard
      await createOrUpdateUser(user);

      // Check if user is admin BEFORE allowing login
      const isAdmin = await checkAdminStatus(user);
      
      if (!isAdmin) {
        // User is not admin, sign them out immediately
        await signOut(auth);
        setError("You do not have admin privileges. Only administrators can access this system.");
        setIsLoading(false);
        return;
      }

      // User is admin - update their document with latest info
      await updateAdminUser(user);

      // Handle remember me
      if (typeof window !== "undefined") {
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("rememberedEmail");
          localStorage.removeItem("rememberMe");
        }
      }

      // Redirect to dashboard
      router.push("/admin");
    } catch (error: any) {
      console.error("Login error:", error);
      setError(
        error.code === "auth/user-not-found" || error.code === "auth/wrong-password"
          ? "Invalid email or password."
          : error.code === "auth/invalid-email"
          ? "Invalid email address."
          : "Failed to sign in. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setForgotPasswordSuccess(false);
    setForgotPasswordLoading(true);

    try {
      if (!auth) {
        throw new Error("Firebase is not initialized. Please check your environment variables.");
      }

      if (!forgotPasswordEmail || !forgotPasswordEmail.includes("@")) {
        setError("Please enter a valid email address.");
        setForgotPasswordLoading(false);
        return;
      }

      // Check if account exists
      const signInMethods = await fetchSignInMethodsForEmail(auth, forgotPasswordEmail);
      if (signInMethods.length === 0) {
        setError("No account found with this email address.");
        setForgotPasswordLoading(false);
        return;
      }

      // Check if the email belongs to an admin
      const isAdmin = await isAdminEmail(forgotPasswordEmail);
      if (!isAdmin) {
        setError("This email does not have admin privileges. Password reset is only available for admin accounts.");
        setForgotPasswordLoading(false);
        return;
      }

      // Send password reset email
      await sendPasswordResetEmail(auth, forgotPasswordEmail);
      setForgotPasswordSuccess(true);
      setError("");
    } catch (error: any) {
      console.error("Forgot password error:", error);
      setError(
        error.code === "auth/invalid-email"
          ? "Invalid email address."
          : error.code === "auth/user-not-found"
          ? "No account found with this email address."
          : "Failed to send password reset email. Please try again."
      );
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <div className={cn("flex min-h-screen w-full", className)}>
      {/* Left Side Image - Hidden on mobile */}
      <div className="w-full hidden md:inline-block relative">
        <img 
          className="h-full w-full object-cover" 
          src="/Images/download-20-1024x683.png" 
          alt="Education" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent"></div>
      </div>

      {/* Right Side Form */}
      <div className="w-full flex flex-col items-center justify-center bg-background p-6 md:p-8">
        <form onSubmit={handleSubmit} className="md:w-96 w-full max-w-md flex flex-col items-center justify-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xl">
              A²
            </div>
            <span className="font-serif text-2xl font-bold text-foreground">A² Institutions</span>
          </Link>

          <h2 className="text-3xl md:text-4xl text-foreground font-medium font-serif">Sign in</h2>
          <p className="text-sm text-muted-foreground mt-3 text-center">
            Welcome back! Please sign in to access the admin dashboard
          </p>

          {/* Error Message */}
          {error && (
            <div className="w-full mt-6 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 p-4">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Google Sign In Button */}
          <button 
            type="button" 
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full mt-8 bg-background hover:bg-muted/50 flex items-center justify-center h-12 rounded-full border border-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-sm font-medium text-foreground">Sign in with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 w-full my-5">
            <div className="w-full h-px bg-border"></div>
            <p className="text-nowrap text-sm text-muted-foreground">or sign in with email</p>
            <div className="w-full h-px bg-border"></div>
          </div>

          {/* Email Input */}
          <div className="flex items-center w-full bg-background border border-input h-12 rounded-full overflow-hidden pl-6 gap-3 mt-8 focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent transition-all">
            <svg className="h-4 w-4 text-muted-foreground flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
            <input 
              type="email" 
              placeholder="Email address" 
              className="bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm w-full h-full" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Password Input */}
          <div className="flex items-center mt-6 w-full bg-background border border-input h-12 rounded-full overflow-hidden pl-6 gap-3 focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent transition-all">
            <svg className="h-4 w-4 text-muted-foreground flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <input 
              type="password" 
              placeholder="Password" 
              className="bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm w-full h-full" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Remember Me and Forgot Password */}
          <div className="w-full flex items-center justify-between mt-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <input 
                className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring" 
                type="checkbox" 
                id="rememberMe" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
              <label className="text-sm cursor-pointer" htmlFor="rememberMe">Remember me</label>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(true);
                setForgotPasswordEmail(email);
                setError("");
                setForgotPasswordSuccess(false);
              }}
              className="text-sm underline hover:text-foreground transition-colors"
              disabled={isLoading}
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="mt-8 w-full h-11 rounded-full text-primary-foreground bg-primary hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Signing in...</span>
              </>
            ) : (
              "Sign In"
            )}
          </button>

          {/* Back to Home Link */}
          <div className="w-full mt-6 pt-6 border-t border-border text-center">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Footer Note */}
          <p className="text-muted-foreground text-xs mt-4 text-center">
            Only users with admin privileges can access this dashboard.
          </p>
        </form>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">Reset Password</h3>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordEmail("");
                    setError("");
                    setForgotPasswordSuccess(false);
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {forgotPasswordSuccess ? (
                <div className="space-y-4">
                  <div className="rounded-lg bg-green-500/10 text-green-700 border border-green-500/20 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-sm font-semibold">Password reset email sent!</p>
                    </div>
                    <p className="text-sm text-green-600/80">
                      Please check your email ({forgotPasswordEmail}) for instructions to reset your password.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotPasswordEmail("");
                      setForgotPasswordSuccess(false);
                    }}
                    className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      placeholder="Enter your admin email"
                      className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                      required
                      disabled={forgotPasswordLoading}
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Password reset is only available for admin accounts.
                    </p>
                  </div>

                  {error && (
                    <div className="rounded-lg bg-destructive/10 text-destructive border border-destructive/20 p-3">
                      <p className="text-sm font-medium">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotPasswordEmail("");
                        setError("");
                      }}
                      className="flex-1 rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                      disabled={forgotPasswordLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotPasswordLoading}
                      className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {forgotPasswordLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Sending...</span>
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

