'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  HMSRoomProvider,
  useHMSActions,
  useHMSStore,
  useVideo,
  selectIsConnectedToRoom,
  selectPeers,
  selectIsLocalAudioEnabled,
  selectIsLocalVideoEnabled,
  type HMSPeer,
} from '@100mslive/react-sdk';
import { getVideoCodeAction } from './actions';

function PeerTile({ peer }: { peer: HMSPeer }) {
  const { videoRef } = useVideo({ trackId: peer.videoTrack ?? '' });
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-md bg-zinc-900">
      <video
        ref={videoRef}
        autoPlay
        muted={peer.isLocal}
        playsInline
        className="h-full w-full object-cover"
      />
      <span className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-0.5 text-xs text-white">
        {peer.name}
        {peer.isLocal ? ' (you)' : ''}
      </span>
    </div>
  );
}

function ConferenceUI({ onLeave }: { onLeave: () => void }) {
  const peers = useHMSStore(selectPeers);
  const isAudioOn = useHMSStore(selectIsLocalAudioEnabled);
  const isVideoOn = useHMSStore(selectIsLocalVideoEnabled);
  const hmsActions = useHMSActions();

  async function toggleAudio() {
    await hmsActions.setLocalAudioEnabled(!isAudioOn);
  }
  async function toggleVideo() {
    await hmsActions.setLocalVideoEnabled(!isVideoOn);
  }
  async function leave() {
    await hmsActions.leave();
    onLeave();
  }

  return (
    <div className="flex h-screen flex-col bg-black">
      <div className="flex-1 grid gap-3 p-4" style={{ gridTemplateColumns: peers.length > 1 ? '1fr 1fr' : '1fr' }}>
        {peers.map((p) => (
          <PeerTile key={p.id} peer={p} />
        ))}
      </div>
      <div className="flex items-center justify-center gap-3 border-t border-zinc-800 bg-zinc-950 px-4 py-3">
        <button
          onClick={toggleAudio}
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            isAudioOn ? 'bg-zinc-800 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {isAudioOn ? 'Mute' : 'Unmute'}
        </button>
        <button
          onClick={toggleVideo}
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            isVideoOn ? 'bg-zinc-800 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {isVideoOn ? 'Stop video' : 'Start video'}
        </button>
        <button
          onClick={leave}
          className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white"
        >
          Leave
        </button>
      </div>
    </div>
  );
}

function VideoRoomInner({ appointmentId, onLeave }: { appointmentId: string; onLeave: () => void }) {
  const hmsActions = useHMSActions();
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await getVideoCodeAction(appointmentId);
      if (cancelled) return;
      if (res.error || !res.code) {
        setError(res.error ?? 'No room code');
        return;
      }
      try {
        const authToken = await hmsActions.getAuthTokenByRoomCode({ roomCode: res.code });
        await hmsActions.join({
          userName: 'Doctor',
          authToken,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to join');
      }
    })();

    return () => {
      cancelled = true;
      hmsActions.leave().catch(() => {});
    };
  }, [appointmentId, hmsActions]);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-red-600">
        {error}
      </div>
    );
  }
  if (!isConnected) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-zinc-500">
        Connecting…
      </div>
    );
  }
  return <ConferenceUI onLeave={onLeave} />;
}

export function VideoRoom({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();
  return (
    <HMSRoomProvider>
      <VideoRoomInner appointmentId={appointmentId} onLeave={() => router.back()} />
    </HMSRoomProvider>
  );
}
