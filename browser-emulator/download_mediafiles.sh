#!/usr/bin/env bash

# Shell setup
# ===========

# Bash options for strict error checking.
set -o errexit -o errtrace -o pipefail -o nounset
shopt -s inherit_errexit 2>/dev/null || true

# Trace all commands.
set -o xtrace


# Download media files
# ====================

# These are used to simulate MediaStreamTracks.

SELF_PATH="$(cd -P -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)" # Absolute canonical path
MEDIAFILES_DIR="$SELF_PATH/src/assets/mediafiles"
mkdir -p "$MEDIAFILES_DIR"

# Mediafiles for Chrome
if [[ ! -f "$MEDIAFILES_DIR/fakevideo_1280x720.y4m" ]]; then
    curl --output "$MEDIAFILES_DIR/fakevideo_1280x720.y4m" \
        --continue-at - \
        --location "https://s3.eu-west-1.amazonaws.com/public.openvidu.io/bbb_1280x720.y4m"
fi
if [[ ! -f "$MEDIAFILES_DIR/fakevideo_640x480.y4m" ]]; then
    curl --output "$MEDIAFILES_DIR/fakevideo_640x480.y4m" \
        --continue-at - \
        --location "https://s3.eu-west-1.amazonaws.com/public.openvidu.io/video_qoe_640x480.y4m"
        # --location "https://s3.eu-west-1.amazonaws.com/public.openvidu.io/bbb_640x480.y4m"

fi
if [[ ! -f "$MEDIAFILES_DIR/fakeaudio.wav" ]]; then
    curl --output "$MEDIAFILES_DIR/fakeaudio.wav" \
        --continue-at - \
        --location "https://s3.eu-west-1.amazonaws.com/public.openvidu.io/audio_qoe.wav"
        # --location "https://s3-eu-west-1.amazonaws.com/public.openvidu.io/bbb.wav"

fi

# Mediafiles for KMS
if [[ ! -f "$MEDIAFILES_DIR/video_640x480.mkv" ]]; then
    curl --output "$MEDIAFILES_DIR/video_640x480.mkv" \
        --continue-at - \
        --location "https://s3.eu-west-1.amazonaws.com/public.openvidu.io/video_qoe_640x480.mkv"

        # --location "https://s3.eu-west-1.amazonaws.com/public.openvidu.io/bbb_640x480.mkv"
    #"https://s3-eu-west-1.amazonaws.com/public.openvidu.io/fakevideo_vp8_opus.mkv"
    # https://s3-eu-west-1.amazonaws.com/public.openvidu.io/fakevideo_h264_opus.mkv
fi
if [[ ! -f "$MEDIAFILES_DIR/video_1280x720.mkv" ]]; then
    curl --output "$MEDIAFILES_DIR/video_1280x720.mkv" \
        --continue-at - \
        --location "https://s3.eu-west-1.amazonaws.com/public.openvidu.io/bbb_1280x720.mkv"
    # https://s3-eu-west-1.amazonaws.com/public.openvidu.io/fakevideo_h264_opus.mkv
fi
