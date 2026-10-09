// Explicit event contract: never forward arbitrary DOM text, query strings or error messages.
export function safeUrl(value: unknown): string {
  try {
    const u = new URL(String(value));
    if (u.protocol !== "https:" && u.protocol !== "http:") return "";
    if (u.hostname === "nitpick.sh" || u.hostname === "www.nitpick.sh") {
      return `https://nitpick.sh${["/", "/privacy/", "/privacy"].includes(u.pathname) ? u.pathname : "/404"}`;
    }
    return u.origin;
  } catch { return ""; }
}

const allowed = new Set([
  "token", "distinct_id", "$device_id", "$session_id", "$window_id", "$lib", "$lib_version",
  "$browser", "$browser_version", "$os", "$os_version", "$device_type", "$screen_height", "$screen_width",
  "$viewport_height", "$viewport_width", "$current_url", "$host", "$pathname", "$referrer", "$referring_domain",
  "$is_identified", "$process_person_profile", "$session_entry_url", "$session_entry_pathname",
  "$pageview_id", "$prev_pageview_id", "$prev_pageview_duration", "$prev_pageview_last_scroll", "$prev_pageview_max_scroll",
  "$prev_pageview_max_scroll_percentage", "$prev_pageview_last_scroll_percentage", "$prev_pageview_max_content_percentage",
  "$prev_pageview_last_content_percentage", "$prev_pageview_last_content", "$prev_pageview_max_content",
  "$web_vitals_LCP_value", "$web_vitals_CLS_value", "$web_vitals_INP_value", "$web_vitals_FCP_value",
  "source", "site_version", "destination", "success", "demo", "$exception_list", "$exception_level",
  "$exception_fingerprint", "$exception_type", "$exception_message",
]);

export function scrubProperties(properties: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (!allowed.has(key)) continue;
    if (key.endsWith("url") || key === "$referrer") clean[key] = safeUrl(value);
    else if (key.includes("pathname")) clean[key] = ["/", "/privacy/", "/privacy"].includes(String(value)) ? value : "/404";
    else if (key === "$exception_type") clean[key] = ["TypeError", "ReferenceError", "SyntaxError", "RangeError", "Error"].includes(String(value)) ? value : "Error";
    else if (key === "$exception_list") {
      clean[key] = Array.isArray(value) ? value.slice(0, 5).map((e) => ({
        type: ["TypeError", "ReferenceError", "SyntaxError", "RangeError", "Error"].includes(e?.type) ? e.type : "Error",
        value: "Browser error (message omitted for privacy)",
        mechanism: { handled: false, synthetic: true, type: "generic" },
        stacktrace: { type: "raw", frames: (e?.stacktrace?.frames ?? []).slice(0, 30).map((f: Record<string, unknown>) => ({
          // Required by the manual error-capture schema; all are fixed safe values.
          platform: "custom", lang: "javascript", function: "redacted", resolved: true,
          filename: typeof f.filename === "string" && f.filename.startsWith("https://nitpick.sh/_astro/") ? f.filename.split(/[?#]/)[0] : "redacted",
          lineno: typeof f.lineno === "number" ? f.lineno : undefined,
          colno: typeof f.colno === "number" ? f.colno : undefined,
        })) },
      })) : [];
    } else if (key === "$exception_message") clean[key] = "Browser error (message omitted for privacy)";
    else if (key === "$exception_fingerprint") continue;
    else clean[key] = value;
  }
  clean.source = "web";
  return clean;
}
