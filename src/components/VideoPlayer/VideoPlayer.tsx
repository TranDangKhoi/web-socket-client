// VideoPlayer.tsx — Vidstack 0.6 (old API)
import "vidstack/styles/community-skin/video.css";
import "vidstack/styles/defaults.css";

import {
    MediaCommunitySkin,
    MediaOutlet,
    MediaPlayer,
    MediaPoster,
} from "@vidstack/react";

type Props = { src: string; poster?: string };

export function VideoPlayer({ src, poster }: Props) {
  return (
    <MediaPlayer
      title="Sprite Fight"
      src={src}
      poster={poster}
      aspectRatio={16 / 9}
      crossorigin=""
    >
      <MediaOutlet>
        <MediaPoster alt="Girl walks into sprite gnomes around her friend on a campfire in danger!" />
        <track
          src="https://media-files.vidstack.io/sprite-fight/subs/english.vtt"
          label="English"
          srcLang="en-US"
          kind="subtitles"
          default
        />
        <track
          src="https://media-files.vidstack.io/sprite-fight/chapters.vtt"
          srcLang="en-US"
          kind="chapters"
          default
        />
      </MediaOutlet>
      <MediaCommunitySkin />
    </MediaPlayer>
  );
}
