import posthog from "posthog-js";
import { scrubProperties } from "./analytics-policy";

const token = import.meta.env.PUBLIC_POSTHOG_PROJECT_TOKEN;
const enabled = import.meta.env.PROD && Boolean(token) && ["nitpick.sh", "www.nitpick.sh"].includes(location.hostname);
const privateVisit = Boolean(location.search || location.hash) || !["/", "/privacy/", "/privacy"].includes(location.pathname);
const optedOut = () => navigator.doNotTrack === "1" || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;

const initialized = enabled && !optedOut();

if (initialized) {
  posthog.init(token, {
    api_host: import.meta.env.PUBLIC_POSTHOG_HOST,
    ui_host: "https://us.posthog.com",
    defaults: "2026-01-30",
    person_profiles: "never",
    respect_dnt: true,
    autocapture: false,
    capture_pageview: true,
    capture_pageleave: true,
    capture_exceptions: true,
    capture_performance: { web_vitals: true },
    disable_session_recording: privateVisit,
    enable_recording_console_log: false,
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: "*",
      blockSelector: ".cast-player, .ph-no-capture",
      recordHeaders: false,
      recordBody: false,
      maskCapturedNetworkRequestFn: () => null,
    },
    before_send: (event) => {
      if (!event || optedOut()) return null;
      if (event.event === "$snapshot") return privateVisit ? null : event;
      event.properties = scrubProperties(event.properties ?? {});
      return event;
    },
    loaded: (client) => client.register({ source: "web", site_version: import.meta.env.PUBLIC_SITE_VERSION || "local" }),
  });
}

export function capture(name: "install_prompt_copied" | "outbound_link_clicked" | "demo_played", properties: Record<string, string | boolean>) {
  if (enabled && !optedOut()) posthog.capture(name, properties);
}

// Capture a fixed label, not the anchor's raw URL or text.
document.addEventListener("click", (event) => {
  const link = (event.target as Element | null)?.closest?.("a");
  if (!link) return;
  const url = new URL(link.href, location.href);
  if (url.hostname !== "github.com") return;
  const destination = url.pathname.startsWith("/LVTD-LLC/nitpick-skills") ? "agent_skill"
    : url.pathname.startsWith("/LVTD-LLC/homebrew-tap") ? "homebrew"
    : url.pathname === "/LVTD-LLC/nitpick" ? "github" : "documentation";
  capture("outbound_link_clicked", { destination });
});

export function optOut() { if (initialized) posthog.opt_out_capturing(); }
export function optIn() { if (initialized && !optedOut()) posthog.opt_in_capturing(); }
