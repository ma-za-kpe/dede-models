#!/usr/bin/env bash
# Auth stays in host gh; Docker receives only downloaded bytes and expected hashes.
# Full read-back is streamed, avoiding a second 1.1 GB local model copy.
set -euo pipefail
cd "$(dirname "$0")/.."
while read -r expected name; do
  [[ "$name" =~ ^[A-Za-z0-9._-]+$ ]] || { echo 'Unsafe asset name' >&2; exit 1; }
  gh release download student-v3-experimental --repo ma-za-kpe/dede-models --pattern "$name" --output - |
    docker run --rm -i --network none -e EXPECTED="$expected" -e ASSET="$name" node:22-bookworm-slim@sha256:43ac6c60b8f89723f746e8a92ce91abd5017e627ce1ddfe4238355d3a30b772c \
      node --input-type=module -e '
        import {createHash} from "node:crypto";
        const hash=createHash("sha256"); let size=0;
        for await(const chunk of process.stdin){hash.update(chunk);size+=chunk.length;}
        const sha256=hash.digest("hex");
        if(sha256!==process.env.EXPECTED)throw new Error("Downloaded checksum mismatch: "+process.env.ASSET);
        if(process.env.ASSET==="student-q4_k_m.gguf" && size!==1107408640)throw new Error("Model size mismatch");
        console.log(JSON.stringify({asset:process.env.ASSET,size_bytes:size,sha256,verified:true}));'
done < SHA256SUMS
# The checksum file itself is checked against the local copy, not against itself.
expected=$(shasum -a 256 SHA256SUMS | awk '{print $1}')
actual=$(gh release download student-v3-experimental --repo ma-za-kpe/dede-models --pattern SHA256SUMS --output - | shasum -a 256 | awk '{print $1}')
[[ "$actual" == "$expected" ]] || { echo 'SHA256SUMS read-back mismatch' >&2; exit 1; }
echo 'PASS: all 10 assets downloaded and matched original checksums, including SHA256SUMS'
