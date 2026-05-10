---
title: "Python Decorators, From Zero to `functools.cache` Internals"
description: "Decorators are functions that modify functions. Learn the four patterns, why @wraps matters, and how lru_cache actually works under the hood."
date: "2026-05-08"
author: "PyPrepHub Editorial"
category: "Python"
tags: ["python", "decorators", "metaprogramming", "interview"]
cover: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1600&q=80"
coverAlt: "Python code"
difficulty: "intermediate"
---

A decorator is a function that takes a function and returns a function. That's the whole concept. Everything else — syntax sugar, stacking, classes — is tactics.

## The one-liner explanation

```python
@log
def greet(name):
    return f"Hello {name}"

# is exactly equivalent to:
def greet(name):
    return f"Hello {name}"
greet = log(greet)
```

`@log` runs at *definition time*, not call time. The name `greet` now points to `log(greet)` — whatever `log` returns.

## Pattern 1: a simple wrapper

```python
from functools import wraps
from time import perf_counter

def timed(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        t0 = perf_counter()
        try:
            return fn(*args, **kwargs)
        finally:
            print(f"{fn.__name__}: {perf_counter() - t0:.3f}s")
    return wrapper

@timed
def slow():
    import time; time.sleep(0.2)
```

Two non-obvious things:

1. **`*args, **kwargs`** — you rarely know the signature of the wrapped function; accept anything.
2. **`@wraps(fn)`** — copies `__name__`, `__doc__`, `__wrapped__` onto the wrapper. Without it, `help(slow)` shows nonsense and `functools.cache` (below) breaks.

## Pattern 2: a decorator with arguments

Now you need *three* levels of function, because `@retry(3)` must itself return a decorator:

```python
def retry(times: int):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            last_exc = None
            for _ in range(times):
                try:
                    return fn(*args, **kwargs)
                except Exception as e:
                    last_exc = e
            raise last_exc
        return wrapper
    return decorator

@retry(3)
def flaky():
    ...
```

Read the `@retry(3)` as: *"call `retry(3)` which returns a decorator, apply that decorator to `flaky`."*

## Pattern 3: stacking

```python
@timed
@retry(3)
def job():
    ...
```

Decorators apply **bottom up**. The `retry(3)` wrapper is built first, then `timed` wraps *that*. So calling `job()` runs: `timed → retry → actual job`. Reverse the order, and retries won't be timed.

## Pattern 4: class-based decorators

Useful when the decorator needs state.

```python
class CallCount:
    def __init__(self, fn):
        wraps(fn)(self)           # copy metadata onto self
        self.fn = fn
        self.calls = 0
    def __call__(self, *args, **kwargs):
        self.calls += 1
        return self.fn(*args, **kwargs)

@CallCount
def tick():
    pass

tick(); tick()
print(tick.calls)  # 2
```

Since a class with `__call__` is callable, it passes the "function takes function, returns callable" contract.

## How `functools.cache` actually works

`functools.cache` (Python 3.9+) is the unbounded version of `lru_cache`. Mental model:

```python
def my_cache(fn):
    hits = 0
    misses = 0
    store = {}
    @wraps(fn)
    def wrapper(*args, **kwargs):
        nonlocal hits, misses
        key = (args, tuple(sorted(kwargs.items())))
        if key in store:
            hits += 1
            return store[key]
        misses += 1
        store[key] = fn(*args, **kwargs)
        return store[key]
    wrapper.cache_info = lambda: {"hits": hits, "misses": misses, "size": len(store)}
    return wrapper
```

The real implementation uses a C-level `dict` and, for `lru_cache`, a doubly-linked list for O(1) eviction. But the semantics are identical: arguments must be hashable, and one call == one key lookup.

**The gotcha that always trips people up:** `cache` remembers *unhashable-argument failures* as exceptions. If you pass a list, you get `TypeError: unhashable type: 'list'` — and that error is not cached, so retries keep re-raising. Convert to tuple at the boundary.

## Interview question: implement `@once`

> Decorate a function so it only ever runs its body once. Subsequent calls return the first result.

```python
from functools import wraps
_sentinel = object()

def once(fn):
    result = _sentinel
    @wraps(fn)
    def wrapper(*args, **kwargs):
        nonlocal result
        if result is _sentinel:
            result = fn(*args, **kwargs)
        return result
    return wrapper
```

The `_sentinel` trick handles the edge case where `fn` legitimately returns `None`. Using `result is None` as the check would re-run forever in that case.

**Follow-up:** make it thread-safe.

```python
from threading import Lock

def once(fn):
    result = _sentinel
    lock = Lock()
    @wraps(fn)
    def wrapper(*args, **kwargs):
        nonlocal result
        if result is _sentinel:
            with lock:
                if result is _sentinel:   # double-checked locking
                    result = fn(*args, **kwargs)
        return result
    return wrapper
```

The outer `is _sentinel` check avoids taking the lock on the common path after initialisation.

## Takeaway

Decorators are a tiny feature with outsized power. Four patterns cover 95% of real code: wrap, parameterise, stack, class-based. Reach for `functools.wraps` every time, and remember that a decorator runs *once* at definition — everything else happens inside the returned wrapper.
