"use client";

import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "@/components/ThemeProvider";
import { getThemeClasses } from "@/lib/theme-classes";

export default function SignInPage() {
  const { dark: isDark } = useTheme();
  const t = getThemeClasses(isDark);

  return (
    <div className={`flex-1 flex items-center justify-center py-12 ${t.pageBg} transition-colors`}>
      <SignIn
        fallbackRedirectUrl="/dashboard"
        appearance={isDark ? { baseTheme: dark } : undefined}
      />
    </div>
  );
}
