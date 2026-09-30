# Licence and attribution

DeDe creator: **[Maku Mazakpe](https://startuptribunal.com/maku)**, Accra, Ghana. Creator identity and profile supplied directly by Maku.

Base model: **Qwen/Qwen3-1.7B**, developed by the Qwen team, revision `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`.

The included `LICENSE` is the complete Apache License 2.0 fetched from that pinned upstream revision. Upstream's file listing contains `LICENSE` and no separate `NOTICE` file. Preserve upstream licence and attribution when redistributing.

DeDe modifications: synthetic-response LoRA fine-tuning (rank 16, two epochs, 241 accepted pairs), merged weights and Q4_K_M quantization. This is a modified model, not an official Qwen release. Original build and training receipts identify the source hashes and software versions. llama.cpp revision used for export is `6a2743f028f78bfb88a7189607b49bde30df3769`; no llama.cpp binaries are bundled here.

The Apache licence is not a claim of fitness or safety. The development-only warning describes this release's intended use and known failures; it does not replace the upstream licence. No DeDe production qualification or endorsement by Qwen is implied.

The training process and synthetic origin are reported by the supplied receipts/handoff; this publication verifies artifact integrity and reviews attached metadata, but does not repeat training or prove absence of memorized content in weights.
