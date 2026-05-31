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
      <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
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
  const [permErr, setPermErr] = useState<string | null>(null);

  // setLocalAudio/VideoEnabled triggers getUserMedia on first call. We catch
  // permission denials and report them so the toggle isn't a silent no-op.
  async function toggleAudio() {
    setPermErr(null);
    try {
      await hmsActions.setLocalAudioEnabled(!isAudioOn);
    } catch (e) {
      setPermErr(`Mic: ${e instanceof Error ? e.message : 'permission denied'}`);
    }
  }
  async function toggleVideo() {
    setPermErr(null);
    try {
      await hmsActions.setLocalVideoEnabled(!isVideoOn);
    } catch (e) {
      setPermErr(`Camera: ${e instanceof Error ? e.message : 'permission denied'}`);
    }
  }
  async function leave() {
    await hmsActions.leave();
    onLeave();
  }

  return (
    // fixed inset-0 covers the entire viewport (including the sticky nav),
    // so the controls bar at the bottom isn't pushed off-screen.
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div
        className="flex-1 grid gap-3 overflow-hidden p-4"
        style={{
          gridTemplateColumns: peers.length > 1 ? 'repeat(2, minmax(0, 1fr))' : '1fr',
        }}
      >
        {peers.length === 0 ? (
          <div className="flex items-center justify-center text-sm text-zinc-400">
            Waiting for someone to join…
          </div>
        ) : (
          peers.map((p) => <PeerTile key={p.id} peer={p} />)
        )}
      </div>
      {!isAudioOn && !isVideoOn && (
        <div className="border-t border-zinc-800 bg-zinc-900 px-4 py-2 text-center text-xs text-zinc-300">
          Click <span className="font-semibold text-white">Unmute</span> or{' '}
          <span className="font-semibold text-white">Start video</span> below — your browser will ask for permission.
        </div>
      )}
      {permErr && (
        <div className="border-t border-red-900/40 bg-red-950/40 px-4 py-2 text-center text-xs text-red-300">
          {permErr} — open the address bar lock icon and allow camera/mic for this site.
        </div>
      )}
      <div className="flex items-center justify-center gap-3 border-t border-zinc-800 bg-zinc-950 px-4 py-4">
        <button
          onClick={toggleAudio}
          className={`rounded-full px-5 py-2.5 text-sm font-medium ${
            isAudioOn ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          {isAudioOn ? 'Mute' : 'Unmute'}
        </button>
        <button
          onClick={toggleVideo}
          className={`rounded-full px-5 py-2.5 text-sm font-medium ${
            isVideoOn ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          {isVideoOn ? 'Stop video' : 'Start video'}
        </button>
        <button
          onClick={leave}
          className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700"
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
        // Join MUTED — many browsers silently deny getUserMedia when it's
        // not driven by a user gesture. The user explicitly clicks Unmute /
        // Start video to trigger the permission prompt from a real click.
        await hmsActions.join({
          userName: 'Doctor',
          authToken,
          settings: {
            isAudioMuted: true,
            isVideoMuted: true,
          },
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black px-6 text-center text-sm text-red-400">
        {error}
      </div>
    );
  }
  if (!isConnected) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black text-sm text-zinc-400">
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
