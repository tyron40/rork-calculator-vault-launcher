import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

let peerConnection: RTCPeerConnection | null = null;
let localStream: MediaStream | null = null;
let remoteStream: MediaStream | null = null;

export async function initializeWebRTC(): Promise<void> {
  if (Platform.OS === 'web') {
    console.log('[WebRTC] Initialized for web platform');
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

  console.log('[WebRTC] Creating new peer connection');
  peerConnection = new RTCPeerConnection(config);

  peerConnection.ontrack = (event) => {
    console.log('[WebRTC] Received remote track:', event.track.kind);
    if (event.streams && event.streams[0]) {
      remoteStream = event.streams[0];
      callbacks.onTrack?.(event);
    }
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      console.log('[WebRTC] New ICE candidate generated');
      callbacks.onIceCandidate?.(event.candidate);
    }
  };

  peerConnection.onconnectionstatechange = () => {
    const state = peerConnection?.connectionState;
    console.log('[WebRTC] Connection state changed:', state);
    if (state) {
      callbacks.onConnectionStateChange?.(state);
    }
  };

  peerConnection.onicecandidateerror = (event: any) => {
    console.error('[WebRTC] ICE candidate error:', event);
  };

  return peerConnection;
}

export async function startLocalStream(
  audio: boolean = true,
  video: boolean = false
): Promise<MediaStream> {
  try {
    console.log('[WebRTC] Starting local stream, audio:', audio, 'video:', video);

    if (Platform.OS === 'web') {
      localStream = await navigator.mediaDevices.getUserMedia({ audio, video });
    } else {
      const mediaDevices = navigator.mediaDevices as any;
      localStream = await mediaDevices.getUserMedia({
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
  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

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
  await peerConnection.setRemoteDescription(new RTCSessionDescription(description));
}

export async function addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
  if (!peerConnection) {
    throw new Error('Peer connection not initialized');
  }

  console.log('[WebRTC] Adding ICE candidate');
  await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
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

export async function saveSignalingMessage(message: SignalingMessage): Promise<void> {
  try {
    const key = `signaling_${message.to}`;
    const stored = await AsyncStorage.getItem(key);
    const messages: SignalingMessage[] = stored ? JSON.parse(stored) : [];
    
    messages.push(message);
    
    if (messages.length > 100) {
      messages.shift();
    }
    
    await AsyncStorage.setItem(key, JSON.stringify(messages));
    console.log('[WebRTC] Signaling message saved for:', message.to);
  } catch (error) {
    console.error('[WebRTC] Error saving signaling message:', error);
    throw error;
  }
}

export async function getSignalingMessages(deviceId: string): Promise<SignalingMessage[]> {
  try {
    const key = `signaling_${deviceId}`;
    const stored = await AsyncStorage.getItem(key);
    const messages: SignalingMessage[] = stored ? JSON.parse(stored) : [];
    
    return messages;
  } catch (error) {
    console.error('[WebRTC] Error getting signaling messages:', error);
    return [];
  }
}

export async function clearSignalingMessages(deviceId: string): Promise<void> {
  try {
    const key = `signaling_${deviceId}`;
    await AsyncStorage.removeItem(key);
    console.log('[WebRTC] Signaling messages cleared for:', deviceId);
  } catch (error) {
    console.error('[WebRTC] Error clearing signaling messages:', error);
  }
}

export async function cleanupWebRTC(): Promise<void> {
  console.log('[WebRTC] Cleaning up WebRTC resources');
  stopLocalStream();
  closePeerConnection();
}
