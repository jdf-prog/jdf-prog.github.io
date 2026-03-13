---
layout: page
title: VerlTool
description: Holistic RL training framework for tool-using language agents. Extends the verl framework with multi-turn rollout, tool execution, and reward integration for agentic tasks.
img: assets/img/mantis-logo.png
importance: 1
category: work
---

**VerlTool** is an open-source framework for holistic reinforcement learning training of tool-using language agents. Built on top of the [verl](https://github.com/volcengine/verl) framework, it supports multi-turn rollout with real tool execution, flexible reward shaping, and scalable training pipelines.

Key features:
- Multi-turn agent rollout with live tool calls (code interpreter, web search, APIs)
- Modular reward functions for tool-use fidelity and task completion
- Compatible with major open LLMs (Qwen, Llama, Mistral, etc.)
- Efficient distributed training via FSDP + vLLM

**Links:** [GitHub](https://github.com/TIGER-AI-Lab/verl-tool) · [Paper](https://arxiv.org/abs/2505.00258)
