import { Platform } from 'react-native';
import { apiClient, WebRTCSignalMessage, WebRTCSignalPayload } from '@/lib/api-client';

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
}

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'stream-request' | 'stream-stop';
  from: string;
  to: string;
  data?: any;
  timestamp: string;
}

interface PeerConnectionCallbacks {
  onTrack?: (event: RTCTrackEvent) => void;
  onIceCandidate?: (candidate: RTCIceCandidate) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  onError?: (error: Error) => void;
}

const DEFAULT_CONFIG: WebRTCConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

type WebRTCAPIShape = {
  RTCPeerConnection: any;
  RTCIceCandidate: any;
  RTCSessionDescription: any;
  mediaDevices: any;
};

const WebRTCAPI: WebRTCAPIShape = {
  RTCPeerConnection: (globalThis as any).RTCPeerConnection,
  RTCIceCandidate: (globalThis as any).RTCIceCandidate,
  RTCSessionDescription: (globalThis as any).RTCSessionDescription,
  mediaDevices: (globalThis as any).navigator?.mediaDevices,
};

function isWebRTCAvailable(): boolean {
  return !!(
    WebRTCAPI.RTCPeerConnection &&
    WebRTCAPI.RTCIceCandidate &&
    WebRTCAPI.RTCSessionDescription &&
    WebRTCAPI.mediaDevices
  );
}

let peerConnection: RTCPeerConnection | null = null;
let localStream: MediaStream | null = null;
let remoteStream: MediaStream | null = null;

export async function initializeWebRTC(): Promise<void> {
  if (Platform.OS === 'web') {
    console.log('[WebRTC] Initialized for web platform');
    return;
  }

  if (!isWebRTCAvailable()) {
    console.warn('[WebRTC] WebRTC primitives are unavailable on this runtime');
    return;
  }

  console.log('[WebRTC] WebRTC service initialized');
}

export async function createPeerConnection(
  config: WebRTCConfig = DEFAULT_CONFIG,
  callbacks: PeerConnectionCallbacks = {}
): Promise<RTCPeerConnection> {
  if (peerConnection) {
    console.log('[WebRTC] Closing existing peer connection');
    peerConnection.close();
  }

  if (!isWebRTCAvailable()) {
    throw new Error('WebRTC is not available in this runtime');
  }

  console.log('[WebRTC] Creating new peer connection');
  const pc = new WebRTCAPI.RTCPeerConnection(config);
  peerConnection = pc;

  pc.ontrack = (event: RTCTrackEvent) => {
    console.log('[WebRTC] Received remote track:', event.track.kind);
    if (event.streams && event.streams[0]) {
      remoteStream = event.streams[0];
      callbacks.onTrack?.(event);
    }
  };

  pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
    if (event.candidate) {
      console.log('[WebRTC] New ICE candidate generated');
      callbacks.onIceCandidate?.(event.candidate);
    }
  };

  pc.onconnectionstatechange = () => {
    const state = peerConnection?.connectionState;
    console.log('[WebRTC] Connection state changed:', state);
    if (state) {
      callbacks.onConnectionStateChange?.(state);
    }
  };

  pc.onicecandidateerror = (event: any) => {
    console.error('[WebRTC] ICE candidate error:', event);
  };

  return pc;
}

export async function startLocalStream(
  audio: boolean = true,
  video: boolean = false
): Promise<MediaStream> {
  try {
    console.log('[WebRTC] Starting local stream, audio:', audio, 'video:', video);

    if (Platform.OS === 'web') {
      localStream = await WebRTCAPI.mediaDevices.getUserMedia({ audio, video });
    } else {
      localStream = await WebRTCAPI.mediaDevices.getUserMedia({
        audio: audio ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } : false,
        video: video ? {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        } : false,
      });
    }

    if (!localStream) {
      throw new Error('Failed to create local stream');
    }
    console.log('[WebRTC] Local stream started with tracks:', localStream.getTracks().length);
    return localStream;
  } catch (error) {
    console.error('[WebRTC] Error starting local stream:', error);
    throw error;
  }
}

export async function addLocalStreamToPeer(): Promise<void> {
  if (!peerConnection) {
    throw new Error('Peer connection not initialized');
  }

  if (!localStream) {
    throw new Error('No local stream available');
  }

  console.log('[WebRTC] Adding local stream to peer connection');
  if (!localStream) {
    throw new Error('Local stream is null');
  }
  const stream = localStream;
  localStream.getTracks().forEach((track) => {
    console.log('[WebRTC] Adding track:', track.kind);
    peerConnection!.addTrack(track, stream);
  });
}

export async function createOffer(): Promise<RTCSessionDescriptionInit> {
  if (!peerConnection) {
    throw new Error('Peer connection not initialized');
  }

  console.log('[WebRTC] Creating offer');
  const offer = await peerConnection.createOffer({
    offerToReceiveAudio: true,
    offerToReceiveVideo: true,
  });

  await peerConnection.setLocalDescription(offer);
  console.log('[WebRTC] Offer created and set as local description');

  return offer;
}

export async function createAnswer(
  offer: RTCSessionDescriptionInit
): Promise<RTCSessionDescriptionInit> {
  if (!peerConnection) {
    throw new Error('Peer connection not initialized');
  }

  console.log('[WebRTC] Creating answer for offer');
  await peerConnection.setRemoteDescription(new WebRTCAPI.RTCSessionDescription(offer));

  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  console.log('[WebRTC] Answer created and set as local description');
  return answer;
}

export async function setRemoteDescription(
  description: RTCSessionDescriptionInit
): Promise<void> {
  if (!peerConnection) {
    throw new Error('Peer connection not initialized');
  }

  console.log('[WebRTC] Setting remote description:', description.type);
  await peerConnection.setRemoteDescription(new WebRTCAPI.RTCSessionDescription(description));
}

export async function addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
  if (!peerConnection) {
    throw new Error('Peer connection not initialized');
  }

  console.log('[WebRTC] Adding ICE candidate');
  await peerConnection.addIceCandidate(new WebRTCAPI.RTCIceCandidate(candidate));
}

export function stopLocalStream(): void {
  if (localStream) {
    console.log('[WebRTC] Stopping local stream');
    localStream.getTracks().forEach((track) => {
      track.stop();
      console.log('[WebRTC] Stopped track:', track.kind);
    });
    localStream = null;
  }
}

export function closePeerConnection(): void {
  if (peerConnection) {
    console.log('[WebRTC] Closing peer connection');
    peerConnection.close();
    peerConnection = null;
  }
  remoteStream = null;
}

export function getLocalStream(): MediaStream | null {
  return localStream;
}

export function getRemoteStream(): MediaStream | null {
  return remoteStream;
}

export function getPeerConnection(): RTCPeerConnection | null {
  return peerConnection;
}

export function getConnectionState(): RTCPeerConnectionState | null {
  return peerConnection?.connectionState || null;
}

export function createSessionId(from: string, to: string): string {
  return `live_${from}_${to}`;
}

export async function sendSignalMessage(
  sessionId: string,
  type: SignalingMessage['type'],
  from: string,
  to: string,
  data?: unknown
): Promise<void> {
  await saveSignalingMessage({
    type,
    from,
    to,
    data: {
      ...(typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : { value: data }),
      sessionId,
    },
    timestamp: new Date().toISOString(),
  });
}

export async function pollSignals(deviceId: string): Promise<SignalingMessage[]> {
  return getSignalingMessages(deviceId);
}

export async function saveSignalingMessage(message: SignalingMessage): Promise<void> {
  try {
    const payload: WebRTCSignalPayload = {
      sessionId: (message.data?.sessionId as string) || `${message.from}_${message.to}`,
      type: message.type,
      from: message.from,
      to: message.to,
      data: message.data,
      timestamp: message.timestamp,
    };

    await apiClient.webrtc.signal(payload);
    console.log('[WebRTC] Signaling message sent to backend for:', message.to);
  } catch (error) {
    console.error('[WebRTC] Error sending signaling message:', error);
    throw error;
  }
}

export async function getSignalingMessages(deviceId: string): Promise<SignalingMessage[]> {
  try {
    const response = await apiClient.webrtc.getSignals(deviceId);
    const messages: WebRTCSignalMessage[] = response.result.data.json.messages ?? [];

    return messages.map((msg) => ({
      type: msg.type,
      from: msg.from,
      to: msg.to,
      data: msg.data,
      timestamp: msg.timestamp,
    }));
  } catch (error) {
    console.error('[WebRTC] Error getting signaling messages:', error);
    return [];
  }
}

export async function clearSignalingMessages(_deviceId: string): Promise<void> {
  console.log('[WebRTC] clearSignalingMessages is handled by backend dequeue semantics');
}

export async function cleanupWebRTC(): Promise<void> {
  console.log('[WebRTC] Cleaning up WebRTC resources');
  stopLocalStream();
  closePeerConnection();
}
