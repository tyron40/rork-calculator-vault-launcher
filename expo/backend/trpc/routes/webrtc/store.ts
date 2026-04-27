export type WebRTCSignalType =
  | 'offer'
  | 'answer'
  | 'ice-candidate'
  | 'stream-request'
  | 'stream-stop';

export interface WebRTCSignalMessage {
  sessionId: string;
  type: WebRTCSignalType;
  from: string;
  to: string;
  data?: unknown;
  timestamp: string;
}

const MAX_MESSAGES_PER_DEVICE = 200;
const MESSAGE_TTL_MS = 5 * 60 * 1000;

const signalingMessagesStore = new Map<string, WebRTCSignalMessage[]>();

function isExpired(message: WebRTCSignalMessage): boolean {
  const ts = new Date(message.timestamp).getTime();
  if (!Number.isFinite(ts)) return true;
  return Date.now() - ts > MESSAGE_TTL_MS;
}

function pruneMessages(messages: WebRTCSignalMessage[]): WebRTCSignalMessage[] {
  const fresh = messages.filter((m) => !isExpired(m));
  if (fresh.length <= MAX_MESSAGES_PER_DEVICE) return fresh;
  return fresh.slice(fresh.length - MAX_MESSAGES_PER_DEVICE);
}

export function enqueueSignal(message: WebRTCSignalMessage): void {
  const current = signalingMessagesStore.get(message.to) || [];
  current.push(message);
  signalingMessagesStore.set(message.to, pruneMessages(current));
}

export function dequeueSignalsForDevice(deviceId: string): WebRTCSignalMessage[] {
  const current = signalingMessagesStore.get(deviceId) || [];
  const fresh = pruneMessages(current);
  signalingMessagesStore.delete(deviceId);
  return fresh;
}
