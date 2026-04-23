"use client";

import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "@/components/ThemeProvider";
import { getThemeClasses } from "@/lib/theme-classes";

export default function SignUpPage() {
  const { dark: isDark } = useTheme();
  const t = getThemeClasses(isDark);

  return (
    <div className={`flex-1 flex flex-col items-center justify-center py-12 ${t.pageBg} transition-colors`}>
      <SignUp
        fallbackRedirectUrl="/dashboard"
        appearance={isDark ? { baseTheme: dark } : undefined}
      />
      <p className={`${t.mutedMore} text-xs mt-6 max-w-xs text-center`}>
        <span className="text-red-400">&hearts;</span> 5% of every subscription
        goes to{" "}
        <a
          href="https://www.crisis.org.uk"
          target="_blank"
          rel="noopener noreferrer"
          className={`${t.muted} hover:text-orange-500 underline`}
        >
          Crisis UK
        </a>{" "}
        to help end homelessness in the UK.
      </p>
    </div>
  );
}
