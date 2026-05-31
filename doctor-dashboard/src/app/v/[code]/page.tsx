import { PublicVideoRoom } from './public-video-room';

// Public, no-auth video page reachable at /v/<roomCode>. The parent app
// links here so it doesn't depend on 100ms's hosted Prebuilt URLs (which
// need a workspace subdomain to be configured).
export default async function PublicVideoPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <PublicVideoRoom code={code} />;
}
