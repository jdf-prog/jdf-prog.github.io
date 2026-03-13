---
layout: page
title: LLM-Blender
description: Ensemble framework for LLMs using pairwise ranking and generative fusion. Consistently outperforms individual models by combining their diverse strengths.
img: assets/img/12.jpg
importance: 5
category: work
---

**LLM-Blender** is an ensembling framework that combines outputs from multiple open-source LLMs to achieve consistently superior performance. It consists of two components: PairRanker (pairwise comparison to select the best candidate) and GenFuser (generative merging of top candidates).

Key contributions:
- PairRanker: cross-attention encoder for fine-grained pairwise output comparison
- GenFuser: seq2seq model that fuses top-ranked candidates into a single output
- MixInstruct benchmark for large-scale pairwise evaluation
- State-of-the-art performance across diverse instruction-following tasks

**Links:** [GitHub](https://github.com/yuchenlin/LLM-Blender) · [Paper](https://aclanthology.org/2023.acl-long.792)
