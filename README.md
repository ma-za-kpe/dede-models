# DeDe model artifacts

Created by [Maku Mazakpe](https://startuptribunal.com/maku), Senior Software Engineer · B2B Agent Intelligence Architect, Accra, Ghana.

**Unqualified—synthetic development testing only.** These model downloads are separate from DeDe's frontend and backend releases. This repository is private; approved collaborators can download its release assets. A pre-release label is not a technical safety control.

## Student v3

Release: [student-v3-experimental](https://github.com/ma-za-kpe/dede-models/releases/tag/student-v3-experimental).

| Property | Value |
| --- | --- |
| File | `student-q4_k_m.gguf` |
| Size | 1,107,408,640 bytes |
| SHA-256 | `c830a1608b31ce0f1ae2ac8bfc063fbae9bbf75bec5cd3216daa876a6ba78dbf` |
| Base | Qwen/Qwen3-1.7B |
| Base revision | `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e` |
| Format | GGUF, Q4_K_M; not ONNX |
| Training | Reported LoRA rank 16, two epochs, 241 accepted synthetic examples from 297 reviewed |
| Target replies | Collected from guarded DeDe backend v0.2.7 |
| Qualification | `production_qualified=false`; no qualified physical-device tiers |

The handoff reports 81/82 automatic checks and audio on all 82 turns **through the backend pipeline**. Human review still found dangerous refusals of help, exclusivity and invented inner life. These scores do not qualify standalone inference. STT, TTS, memory and safety gates are not inside this language-model file.

## Download and verify

Install/authenticate the GitHub CLI with repository read access. Do not put a GitHub token into an app or distribute one to users.

```sh
mkdir -p downloads/student-v3-experimental
gh release download student-v3-experimental \
  --repo ma-za-kpe/dede-models \
  --dir downloads/student-v3-experimental
cd downloads/student-v3-experimental
shasum -a 256 -c SHA256SUMS
```

All listed assets must pass before use. Compare the model hash against the value above as well. A checksum detects corruption; it is **not a publisher signature**. Signed manifests and rollback protection are still required before mobile distribution. Do not overwrite a released asset with different bytes: create a new version instead.

Assets include the model, this README, upstream licence/attribution, original build/training/admission receipts, the synthetic evaluation transcript, a release manifest and checksums. Training corpora, the adapter and BF16 weights are not included in this release. They are retained separately and require their own reviewed export for rebuilding/conversion.

## Backend codebase: synthetic-only integration

Use an explicitly authorized test compute host; do not rent a new box automatically. Keep workloads in Docker on the development Mac, and keep real user content off Vast. These are operator instructions, **not a claim that this release was rerun or qualified**.

1. Verify the artifact. Build/pin a `llama-server` runtime compatible with the recorded llama.cpp revision `6a2743f028f78bfb88a7189607b49bde30df3769`. Do not pull an unpinned `latest` image into a release pipeline.
2. Inside that test runtime, serve the model on a private/loopback interface, with thinking disabled:

   ```sh
   llama-server -m /models/student-q4_k_m.gguf \
     --alias dede-student-v3 --host 127.0.0.1 --port 8001 \
     --ctx-size 4096 --jinja --chat-template-kwargs '{"enable_thinking":false}'
   ```

   The context size above is a test starting point, not a measured phone tier. If API and model run in separate containers, use an isolated Docker network and its service name; container-local `127.0.0.1` does not reach another container. Do not publish the model endpoint publicly, enable tools, or attach personal files.

3. In an isolated `dedecorebackend` test deployment, use its existing configuration fields:

   ```text
   DEDE_LLM_BASE_URL=http://127.0.0.1:8001/v1
   DEDE_LLM_MODEL=dede-student-v3
   DEDE_LLM_ARTIFACT_SHA256=c830a1608b31ce0f1ae2ac8bfc063fbae9bbf75bec5cd3216daa876a6ba78dbf
   DEDE_LLM_QUANTIZATION=Q4_K_M
   DEDE_USER_DATA_ALLOWED=false
   ```

   Supply authentication separately through the normal secret channel. The configured hash is operator-declared metadata; it does not verify the loaded file. Verify it before startup. Use the current backend's documented API/fixtures; do not bypass the decision graph, age handling, emergency gate or reply self-check.
4. Run synthetic law fixtures through the complete backend path, preserving model/runtime/backend versions and raw results. Standalone `/v1/chat/completions` testing measures only the language model, never the companion or emergency delivery.
5. Re-run held-out stateful and full-voice suites; gate decisions and route requests do not prove a call or beacon reached anyone. New server guards do not establish that this old student passes every case.

The previously used Vast instance is deleted. Downloading this release does not bring up any service.

## Current PWA (`dedeui`)

The PWA uses Transformers.js with ONNX artifacts. **Do not replace its model URL with this GGUF URL or rename the extension.** Its `public/local-worker.js` model registry, network allowlist and pinned hash table must agree with the actual runtime and artifact format; `public/model-integrity.js` performs verification.

A future synthetic browser experiment requires either:

- Exporting the pinned base plus retained LoRA adapter/merged high-precision weights to a supported ONNX layout, then separately quantizing, hashing and evaluating it; or
- Implementing a browser GGUF runtime as a separate integration and qualifying that runtime.

Do not treat either as a lossless or already-tested conversion. Private GitHub assets are for authorized developers, not a browser distribution endpoint: never embed a repo token in the PWA. A future public artifact endpoint needs CORS/range/resume tests and a signed manifest. The current app has limited local guards, **not parity with the backend safety graph**. Keep the candidate disconnected from real-person chat until qualification is complete.

## Future Android and iOS apps

1. Compare llama.cpp/GGUF, ExecuTorch and LiteRT on representative capable and constrained phones; do not choose a production runtime or model size from the file size alone.
2. Implement a shared Rust/C++ safety spine, or Kotlin/Swift implementations producing identical receipts against the same platform-neutral law fixtures. Emergency/age decisions and output checks must remain outside probabilistic model wording. Backend behavior is not automatically transferred into the weights.
3. Keep memory, notes and Bond state in the encrypted device vault with client-encrypted R2 sync, recovery and verified restore. A model update must not reset memory. Biometrics unlock keys; model weights are not the user's memory or encryption key.
4. Download to temporary storage; verify a signed manifest, exact bytes/hash and compatibility before atomic activation. Preserve a known-good version and test interrupted downloads, corruption, cancellation, low storage and rollback. Never auto-promote this experimental release.
5. Qualify **teacher → unquantized student → quantized artifact → runtime → physical device tier** independently. Run applicable living simulations at every stage, including minors, multilingual requests, false alarms, grounded recall, correction/deletion and beacon receipts.
6. Measure peak RAM (weights + KV cache + runtime + speech), cold start, response latency, battery, sustained thermals, offline operation and STT/TTS contention. This GGUF supplies neither speech model.

Until these gates pass, no real-person rollout, emergency reliance or production-safe label is warranted. Tests passing on a server do not qualify a phone.

## Provenance and licence

See [ATTRIBUTION.md](ATTRIBUTION.md), [LICENSE](LICENSE), [release-manifest.json](release-manifest.json) and [TASKS.md](TASKS.md). Original receipts are preserved unchanged, including historical fields: the build receipt's nested source describes the baseline and its `evaluations` array is empty; use the separate evaluation file and training receipt rather than treating that array as proof of qualification. The referenced BF16 artifact is not attached.

Primary references: [pinned Qwen base](https://huggingface.co/Qwen/Qwen3-1.7B/tree/70d244cc86ccca08cf5af4e1e306ecf908b1ad5e), [pinned llama.cpp server documentation](https://github.com/ggml-org/llama.cpp/blob/6a2743f028f78bfb88a7189607b49bde30df3769/tools/server/README.md), [ExecuTorch mobile LLMs](https://docs.pytorch.org/executorch/stable/llm/working-with-llms.html).
