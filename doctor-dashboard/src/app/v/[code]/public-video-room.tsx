'use client';

import { useEffect, useState } from 'react';
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

function ConferenceUI() {
  const peers = useHMSStore(selectPeers);
  const isAudioOn = useHMSStore(selectIsLocalAudioEnabled);
  const isVideoOn = useHMSStore(selectIsLocalVideoEnabled);
  const hmsActions = useHMSActions();
  const [permErr, setPermErr] = useState<string | null>(null);

  async function ensurePermission(kind: 'audio' | 'video') {
    const stream = await navigator.mediaDevices.getUserMedia(
      kind === 'audio' ? { audio: true } : { video: true },
    );
    stream.getTracks().forEach((t) => t.stop());
  }
  async function toggleAudio() {
    setPermErr(null);
    if (!isAudioOn) {
      try { await ensurePermission('audio'); }
      catch (e) {
        setPermErr(`Mic blocked: ${e instanceof Error ? e.message : 'access denied'}`);
        return;
      }
    }
    try { await hmsActions.setLocalAudioEnabled(!isAudioOn); }
    catch (e) { setPermErr(`Mic: ${e instanceof Error ? e.message : 'toggle failed'}`); }
  }
  async function toggleVideo() {
    setPermErr(null);
    if (!isVideoOn) {
      try { await ensurePermission('video'); }
      catch (e) {
        setPermErr(`Camera blocked: ${e instanceof Error ? e.message : 'access denied'}`);
        return;
      }
    }
    try { await hmsActions.setLocalVideoEnabled(!isVideoOn); }
    catch (e) { setPermErr(`Camera: ${e instanceof Error ? e.message : 'toggle failed'}`); }
  }
  async function leave() {
    await hmsActions.leave();
    window.close();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div
        className="flex-1 grid gap-3 overflow-hidden p-4"
        style={{
          gridTemplateColumns: peers.length > 1 ? 'repeat(2, minmax(0, 1fr))' : '1fr',
        }}
      >
        {peers.length === 0 ? (
          <div className="flex items-center justify-center text-sm text-zinc-400">
            Waiting for the doctor to join…
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

function VideoRoomInner({ code }: { code: string }) {
  const hmsActions = useHMSActions();
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const authToken = await hmsActions.getAuthTokenByRoomCode({ roomCode: code });
        if (cancelled) return;
        await hmsActions.join({
          userName: 'Parent',
          authToken,
          settings: { isAudioMuted: true, isVideoMuted: true },
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to join');
      }
    })();

    return () => {
      cancelled = true;
      hmsActions.leave().catch(() => {});
    };
  }, [code, hmsActions]);

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
  return <ConferenceUI />;
}

export function PublicVideoRoom({ code }: { code: string }) {
  return (
    <HMSRoomProvider>
      <VideoRoomInner code={code} />
    </HMSRoomProvider>
  );
}
