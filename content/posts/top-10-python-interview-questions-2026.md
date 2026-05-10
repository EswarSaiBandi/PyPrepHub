---
title: "Top 10 Python Interview Questions (2026 Edition)"
description: "Ten Python questions we actually ask candidates — with the answers, common follow-ups, and the traps you want to avoid."
date: "2026-04-18"
author: "PyPrepHub Editorial"
category: "Interviews"
tags: ["python", "interview", "challenge", "coding"]
cover: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600&q=80"
coverAlt: "Developer at work"
trending: true
featured: true
difficulty: "intermediate"
---

This is our refreshed 2026 shortlist — not what you'll find on LeetCode, but the questions hiring managers at data-heavy companies actually use to separate competent from strong.

## 1. Mutable default arguments

> What does this print, and why?

```python
def add(item, bucket=[]):
    bucket.append(item)
    return bucket

print(add(1))
print(add(2))
```

Prints `[1]` then `[1, 2]`. The default value `[]` is evaluated *once* at function definition time — subsequent calls share the same list.

**Fix:**

```python
def add(item, bucket=None):
    if bucket is None:
        bucket = []
    bucket.append(item)
    return bucket
```

## 2. `is` vs `==`

`is` tests identity (same object), `==` tests equality. `a == b` can be `True` with `a is b` being `False`. Watch out for small-int caching (CPython interns integers `-5` to `256`), which makes `1000 is 1000` implementation-defined.

## 3. Shallow vs deep copy

```python
import copy
a = [[1, 2], [3, 4]]
b = a.copy()          # shallow
b[0].append(99)
print(a)              # [[1, 2, 99], [3, 4]] — the inner list is shared
```

`copy.deepcopy` recursively clones. For most practical cases, prefer designing immutable data over deep-copying.

## 4. Decorators

A decorator is a function that takes a function and returns a function. Always preserve metadata with `functools.wraps`:

```python
from functools import wraps

def log(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        print(f"calling {fn.__name__}")
        return fn(*args, **kwargs)
    return wrapper
```

Follow-up: implement `@lru_cache` from scratch.

## 5. Generators vs iterators

An iterator is any object with `__iter__` and `__next__`. A generator is the lazy form — defined with `def` + `yield`. Generators are iterators; iterators aren't necessarily generators.

```python
def take(iterable, n):
    it = iter(iterable)
    for _ in range(n):
        yield next(it)
```

Follow-up: explain why `yield from` is not just syntactic sugar (it also forwards `send` and exceptions).

## 6. The GIL

Python's Global Interpreter Lock lets only one thread execute Python bytecode at a time. Implications:

- Threading helps I/O-bound work (requests, DB calls) — the GIL releases on I/O.
- Threading does *not* help CPU-bound work. Use `multiprocessing` or drop to C extensions (NumPy, Numba).
- Python 3.13 ships an experimental "no-GIL" build; Python 3.14 will ship it non-experimentally. The knowledge cost of the GIL is still high in 2026.

## 7. Context managers

Anything with `__enter__` and `__exit__`. The cleanest modern form is `@contextlib.contextmanager`:

```python
from contextlib import contextmanager

@contextmanager
def timer(label):
    from time import perf_counter
    t0 = perf_counter()
    try:
        yield
    finally:
        print(f"{label}: {perf_counter() - t0:.3f}s")

with timer("query"):
    run_query()
```

## 8. Data classes vs named tuples vs dicts

| Need                              | Use                    |
|-----------------------------------|------------------------|
| Lightweight, immutable record     | `NamedTuple`           |
| Mutable record with methods       | `@dataclass`           |
| Frozen, hashable, immutable       | `@dataclass(frozen=True)` |
| Runtime-only key/value bag        | `dict`                 |
| Strongly validated external data  | `pydantic.BaseModel`   |

## 9. `__slots__`

`__slots__` avoids per-instance `__dict__`, reducing memory and speeding attribute access. Use it when you have millions of small objects. Trade-off: you give up dynamic attribute addition.

## 10. `async` vs threading

`asyncio` runs a single thread that multiplexes many waiting coroutines over one event loop — ideal when you have many I/O operations happening concurrently. Threading is preemptive; asyncio is cooperative.

**The modern rule:** prefer `asyncio` for new network-heavy code, `concurrent.futures.ThreadPoolExecutor` for quick wins on existing blocking libraries, `multiprocessing` for CPU-bound work, and `subprocess` for shelling out.

## Takeaway

No trick question in this list relies on memorisation — each one rewards understanding the runtime model. Read the CPython source for any that feel fuzzy; thirty minutes there beats a year of flashcards.
