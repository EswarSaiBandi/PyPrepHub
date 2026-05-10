---
title: "Python List Comprehensions: A Complete Guide with Interview Examples"
description: "Master list, set, and dict comprehensions in Python. When to use them, when to avoid them, and how they show up in interviews."
date: "2026-05-06"
updated: "2026-05-06"
author: "PyPrepHub Editorial"
category: "Python"
tags: ["python", "comprehensions", "performance", "interview"]
cover: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1600&q=80"
coverAlt: "Python code on a screen"
featured: true
trending: true
difficulty: "beginner"
---

List comprehensions are one of Python's most loved features — and one of the most frequently abused. This guide covers everything you need for day-to-day code and for the interview.

## Why comprehensions exist

A comprehension is a compact expression that builds a collection by iterating over another iterable. Compare the two styles:

```python
# Loop style
squares = []
for x in range(10):
    squares.append(x * x)

# Comprehension
squares = [x * x for x in range(10)]
```

Both produce the same list. The comprehension is shorter, a touch faster (one `LOAD_METHOD` for `append` is skipped), and — when simple — easier to read.

## The four flavors

Python has four comprehension forms:

```python
[x for x in it]          # list
{x for x in it}          # set
{k: v for k, v in it}    # dict
(x for x in it)          # generator (lazy)
```

Generator expressions are lazy: they don't build the whole collection up front, so they're the right choice when you're feeding a consumer like `sum`, `any`, or `max`.

```python
total = sum(x * x for x in range(10_000_000))  # constant memory
```

## Filtering and conditional expressions

Two different things, often confused in interviews:

```python
# Filter: decide whether to include each item (clause at the end)
evens = [x for x in nums if x % 2 == 0]

# Conditional: decide the value for each item (ternary in the expression)
signs = [1 if x > 0 else -1 if x < 0 else 0 for x in nums]
```

A classic interviewer follow-up: *"Can you combine both?"* Yes:

```python
# Keep only positives, halve them
result = [x / 2 for x in nums if x > 0]
```

## Nested loops

Comprehensions read left-to-right, top-to-bottom — the same order as the equivalent `for` loops.

```python
flat = [item for row in matrix for item in row]
```

is equivalent to:

```python
flat = []
for row in matrix:
    for item in row:
        flat.append(item)
```

## When *not* to use comprehensions

Readability beats compactness. Rewrite as a loop if:

1. You nest more than two `for` clauses.
2. You need `try/except` per item.
3. You're doing side effects (printing, logging, mutating).
4. The expression no longer fits on one line.

## Interview question: deduplicate while preserving order

```python
def dedupe(items):
    seen = set()
    return [x for x in items if not (x in seen or seen.add(x))]
```

The `or seen.add(x)` trick works because `set.add` returns `None` (falsy), so the filter evaluates to `not False` — keeping the item and updating `seen` in one expression. In production, prefer `dict.fromkeys(items)` which is cleaner and Python ≥ 3.7 preserves insertion order.

## Performance checklist

- Comprehensions are ~20–30% faster than the equivalent `for`/`append` loop for simple cases.
- A generator expression + `sum()`/`any()` beats `[...]` + `sum()` on memory.
- When building a dict from two sequences, `dict(zip(keys, values))` is faster than a dict comprehension.

## Takeaway

Comprehensions are a scalpel, not a hammer. One line of intent — great. Three nested `for` clauses and a chained ternary — rewrite it.
