export function getThemeClasses(dark: boolean) {
  return {
    // Page backgrounds
    pageBg: dark ? "bg-[#0f0f0f] text-white" : "bg-white text-zinc-900",
    sectionBg: dark ? "bg-[#1a1a1a]" : "bg-zinc-50",

    // Cards
    cardBg: dark
      ? "bg-[#1a1a1a] border-[#2a2a2a]"
      : "bg-white border-zinc-200 shadow-sm",
    cardAccent: dark
      ? "bg-[#1a1a1a] border border-[#2a2a2a] border-l-2 border-l-orange-500"
      : "bg-white border border-zinc-200 border-l-2 border-l-orange-500 shadow-sm",

    // Text
    heading: dark ? "text-white" : "text-zinc-900",
    body: dark ? "text-zinc-300" : "text-zinc-700",
    muted: dark ? "text-zinc-400" : "text-zinc-500",
    mutedMore: dark ? "text-zinc-500" : "text-zinc-400",
    label: dark ? "text-zinc-300" : "text-zinc-700",

    // Inputs
    input: dark
      ? "bg-[#222] border-[#333] text-white placeholder-zinc-500"
      : "bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400",
    inputFocus: "focus:ring-2 focus:ring-orange-500 focus:border-orange-500",

    // Borders
    border: dark ? "border-[#2a2a2a]" : "border-zinc-200",

    // Buttons
    ghostBtn: dark
      ? "text-zinc-400 hover:text-white hover:bg-white/10"
      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100",

    // Misc
    vatBox: dark
      ? "bg-[#1a1a1a] border border-[#2a2a2a]"
      : "bg-zinc-50 border border-zinc-200",
    totalBox: dark
      ? "bg-[#1a1a1a] border border-[#2a2a2a]"
      : "bg-zinc-50 border border-zinc-200",
  };
}
