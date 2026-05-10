---
title: "Prompt Engineering for Production LLMs"
description: "The six patterns that move models from demo to production: structured output, few-shot, CoT, self-consistency, tool use, and evals."
date: "2026-04-22"
author: "PyPrepHub Editorial"
category: "AI"
tags: ["ai", "llm", "prompt-engineering", "production"]
cover: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1600&q=80"
coverAlt: "AI workspace"
trending: true
difficulty: "intermediate"
---

"Prompt engineering" is a loaded term. In this post I mean the boring, engineering-heavy version: patterns that make LLM outputs *reliable enough to power a feature*, not demos that look good on Twitter.

## Pattern 1: Structured output, always

The number-one source of production bugs is parsing free-form model output. Modern APIs give you two escape hatches:

- **JSON mode** — the model is constrained to emit valid JSON.
- **Schema mode** — stricter still, the output conforms to a JSON Schema you provide.

```python
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": prompt}],
    tools=[{
        "name": "extract_order",
        "description": "Extract structured order info",
        "input_schema": {
            "type": "object",
            "properties": {
                "order_id": {"type": "string"},
                "total":    {"type": "number"},
                "items":    {"type": "array", "items": {"type": "string"}},
            },
            "required": ["order_id", "total", "items"],
        },
    }],
    tool_choice={"type": "tool", "name": "extract_order"},
)
```

Always prefer schema-enforced output over "please output JSON." The model cannot drift when the decoder physically refuses anything but valid JSON.

## Pattern 2: Few-shot examples

For classification and extraction, 3–5 good examples in the prompt beat any amount of instruction prose:

```
Classify each message as SUPPORT / SALES / BILLING.

Examples:
"I can't log in" → SUPPORT
"Where's my invoice?" → BILLING
"Do you offer annual plans?" → SALES
"My password reset link expired" → SUPPORT
"Want to book a demo" → SALES

Message: "Charge on my card I don't recognise"
→
```

Rules of thumb:

- **Cover the edge cases you see in prod.** Examples should span the boundaries between classes.
- **Order matters slightly** — put the ambiguous ones *last* so they're fresh in the model's context.
- **Keep labels consistent.** `"SUPPORT"` and `"support"` are different tokens.

## Pattern 3: Chain-of-thought (CoT)

For anything requiring multi-step reasoning (math, code, policy decisions), tell the model to think before answering:

```
Think step-by-step, then give your final answer on the last line prefixed with "Answer: ".
```

Three production-hardening moves around CoT:

1. **Ask for reasoning, extract the final line.** Parse only the `Answer: ` line for downstream systems.
2. **Log the full reasoning.** Debugging without it is brutal.
3. **Use "extended thinking" APIs when available** — newer Claude models have a dedicated thinking budget that's cheaper to generate than visible tokens.

## Pattern 4: Self-consistency

For high-stakes decisions, sample the same prompt 3–5 times and take the majority:

```python
answers = [call_model(prompt, temperature=0.7) for _ in range(5)]
final = Counter(answers).most_common(1)[0][0]
```

Costs 5× inference, reduces error rate roughly in half on reasoning tasks. Worth it for fraud-review style workflows; overkill for chat replies.

## Pattern 5: Tool use (function calling)

If the model needs current data or side effects, don't prompt it to *describe* an action — let it *call* a tool:

```python
tools = [
    {
        "name": "get_weather",
        "description": "Current weather for a city",
        "input_schema": {
            "type": "object",
            "properties": {"city": {"type": "string"}},
            "required": ["city"],
        },
    },
]

resp = client.messages.create(model=MODEL, tools=tools, messages=[...])
```

The model emits a structured tool call; your code runs it; you append the result and ask the model to continue. Three-turn loop at most for simple agents.

**Production tips:**

- Limit tool loops. Cap at 5 iterations so a buggy model can't spin forever.
- Validate tool inputs. `city="DROP TABLE users"` has happened.
- Prefer narrow tools over wide ones. Five small tools beat one swiss-army tool.

## Pattern 6: Evals are the product

A prompt isn't done when it looks right — it's done when it *passes a test set*:

```python
def evaluate(prompt: str, cases: list[dict]) -> float:
    correct = 0
    for case in cases:
        pred = call_model(prompt.format(**case))
        if pred.strip() == case["expected"]:
            correct += 1
    return correct / len(cases)
```

Maintain 50–200 labelled cases covering normal, edge, and adversarial inputs. Every prompt or model change gets re-scored. This is the single highest-leverage investment you can make in an LLM product.

## Prompt-caching economics

In 2026 every major provider supports **prompt caching** — the reusable prefix of your prompt is stored server-side and subsequent calls pay 10–20% of the price and latency. Put the *stable* parts of your prompt first:

```
[System instructions — large, rarely changes]     ← cached
[Few-shot examples — stable]                       ← cached
[User-specific context — changes per user]         ← fresh
[Current user message]                             ← fresh
```

For a long-system-prompt chatbot, the cost difference is frequently 5–10×.

## The two anti-patterns to avoid

- **"Let me chain 12 prompts together in LangChain."** Chains compound error rates. If step 1 is 95% accurate and step 2 is 95%, the chain is 90%. Flatten aggressively.
- **"The model will figure it out."** If you can't write a clear spec for the output, neither can the model. Ambiguous prompts produce ambiguous outputs.

## Takeaway

Production prompting is 80% boring structure — schemas, examples, eval harnesses — and 20% craft. The teams that ship reliable LLM features are the ones treating prompts as code: version-controlled, tested against a regression set, and measured against a dashboard.
