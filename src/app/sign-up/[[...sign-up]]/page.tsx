import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12">
      <SignUp fallbackRedirectUrl="/dashboard" />
      <p className="text-zinc-600 text-xs mt-6 max-w-xs text-center">
        <span className="text-red-400">&hearts;</span> 5% of every subscription
        goes to{" "}
        <a
          href="https://www.crisis.org.uk"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-500 hover:text-zinc-300 underline"
        >
          Crisis UK
        </a>{" "}
        to help end homelessness in the UK.
      </p>
    </div>
  );
}
