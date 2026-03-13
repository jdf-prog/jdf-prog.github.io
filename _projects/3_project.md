---
layout: page
title: AceCoder
description: Reinforcement learning from execution feedback for competitive-level code generation. Achieves state-of-the-art on coding benchmarks with verified test-case rewards.
img: assets/img/12.jpg
importance: 3
category: work
---

**AceCoder** applies reinforcement learning with execution-based feedback to train code generation models. By using test-case pass rates as reward signals rather than human preference labels, AceCoder achieves strong performance on competitive programming benchmarks.

Key contributions:
- Execution-based RL reward using test case pass/fail signals
- Competitive performance on HumanEval, MBPP, and LiveCodeBench
- Applicable to any instruction-tuned code LLM as a post-training stage
- Open-source training code and model checkpoints

**Links:** [GitHub](https://github.com/TIGER-AI-Lab/AceCoder) · [Paper](https://arxiv.org/abs/2502.01718)
