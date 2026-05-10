---
title: "NumPy Fancy Indexing: A Practical Tour"
description: "Boolean masks, integer arrays, np.where, and np.take — the four tools that replace every for-loop you wrote over arrays."
date: "2026-05-05"
author: "PyPrepHub Editorial"
category: "NumPy"
tags: ["numpy", "indexing", "vectorization", "performance"]
cover: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=1600&q=80"
coverAlt: "Matrix visualization"
difficulty: "intermediate"
---

If broadcasting is the "how can I avoid loops over columns" tool, fancy indexing is the "how can I avoid loops over rows" tool. Together they cover virtually every vectorisation scenario.

## Three flavours of indexing

```python
import numpy as np
X = np.arange(20).reshape(4, 5)

X[0, 0]        # basic:   scalar indexing
X[1:3, :]      # basic:   slicing -> view
X[[0, 2, 3]]   # fancy:   integer arrays -> copy
X[X > 10]      # fancy:   boolean mask  -> copy
```

**Basic indexing** (scalars and slices) returns a *view* — shares memory with the original. **Fancy indexing** (integer or boolean arrays) returns a *copy*. Knowing which is which matters for both performance and correctness.

## Boolean masks

Conditions produce boolean arrays, which act as "select these rows" instructions:

```python
mask = X[:, 0] > 5
X[mask]                  # rows where first column > 5
X[mask, :2]              # same rows, first two columns
X[mask] = 0              # in-place modify — legal and useful
```

The mask shape must match the axis you're filtering. For 2D selection:

```python
X[X % 2 == 0] = -1        # all even values become -1
```

## Integer-array indexing

Pass an array of row indices to select rows in any order, with repeats:

```python
idx = np.array([3, 0, 3, 1])
X[idx]                   # 4x5 result, row 3 twice, row 0, row 1
```

Two integer arrays index pairs element-wise:

```python
rows = np.array([0, 2, 3])
cols = np.array([1, 4, 2])
X[rows, cols]            # picks X[0,1], X[2,4], X[3,2]
```

**This is the trick** every NumPy interview question tests — the element-wise pairing is *not* a Cartesian product. To get a sub-matrix, use `np.ix_`:

```python
X[np.ix_(rows, cols)]    # 3x3 sub-matrix — the Cartesian product
```

## `np.where` — the Swiss-army knife

`np.where(cond, a, b)` is a vectorised ternary:

```python
np.where(X > 10, X, 0)      # X if > 10, else 0
np.where(X > 10, 'big', 'small')  # dtype dtype=<U5
```

Called with one argument, it returns index arrays:

```python
rows, cols = np.where(X > 15)   # coords of matches
```

Good for converting "find where" into "use these indices" pipelines.

## `np.take` and `np.take_along_axis`

For selecting along a specific axis, these are clearer and sometimes faster than fancy indexing:

```python
np.take(X, [2, 0], axis=0)            # rows 2 then 0
np.take(X, [4, 1, 0], axis=1)         # columns in a new order
```

`take_along_axis` is perfect for "pick one element per row":

```python
idx = X.argmax(axis=1, keepdims=True)   # shape (4, 1)
np.take_along_axis(X, idx, axis=1)      # shape (4, 1) — max of each row
```

## Views vs copies — how to tell

```python
y = X[1:3]
y.base is X                # True  — y is a view into X

z = X[[0, 2]]
z.base is X                # False — z is a fresh copy
```

Mutating `y[0, 0] = 999` changes `X`. Mutating `z[0, 0] = 999` does not. This is the single biggest source of "I fixed a bug and broke a different one" in NumPy code — always ask yourself which kind of access you used.

## Interview question: top-k per row

> Given `X` of shape `(n, d)`, return an `(n, k)` array where row `i` contains the `k` largest values of row `i`, in descending order.

```python
def top_k(X: np.ndarray, k: int) -> np.ndarray:
    # argpartition: O(d) unordered top-k, much faster than full argsort
    top = np.argpartition(X, -k, axis=1)[:, -k:]
    # but top-k is unordered; sort within the k
    rows = np.arange(X.shape[0])[:, None]
    ordered = np.argsort(-np.take_along_axis(X, top, axis=1), axis=1)
    idx = np.take_along_axis(top, ordered, axis=1)
    return np.take_along_axis(X, idx, axis=1)
```

Two key ideas: `argpartition` is linear-time and unordered (fast), and the `rows[:, None]` broadcast lets you pair row indices with column indices without looping.

## Gotcha: assignment through fancy indexing

```python
X[[0, 0, 0]] += 1
```

What's `X[0]` after this? It's `original + 1`, not `original + 3`. Fancy-indexed assignment reads the original, adds 1, writes back — three times. The writes clobber each other.

Use `np.add.at` for the "do all increments" semantics:

```python
np.add.at(X, [0, 0, 0], 1)    # X[0] becomes original + 3
```

This is how you build histograms and scatter operations correctly.

## Takeaway

Fancy indexing is the right replacement for almost every `for row in X:` loop. Remember: boolean masks and integer arrays return **copies**; pairs of index arrays are **element-wise**, not Cartesian; and `np.add.at` exists for the duplicate-index scatter you'll eventually need.
