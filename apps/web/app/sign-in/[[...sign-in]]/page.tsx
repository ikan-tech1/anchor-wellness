import { SignIn } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-6 grain bg-mesh safe-top safe-bottom">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/12 text-2xl shadow-soft">
          ⚓
        </div>
        <h1 className="font-serif text-3xl font-medium tracking-tight">Welcome back</h1>
        <p className="mt-2 text-muted-foreground">Sign in to continue your wellness journey</p>
      </div>
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        forceRedirectUrl="/home"
        fallbackRedirectUrl="/home"
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-elevated rounded-2xl border-border/80",
          },
        }}
      />
    </div>
  );
}
