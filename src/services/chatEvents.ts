/**
 * Global chat event dispatcher for WeatherGPT
 * Allows sidebar, mobile drawer, topbar, and hotkeys to trigger a clean New Chat reset.
 */

export const NEW_CHAT_EVENT = 'weathergpt:new-chat'

export function triggerNewChat(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(NEW_CHAT_EVENT))
  }
}
