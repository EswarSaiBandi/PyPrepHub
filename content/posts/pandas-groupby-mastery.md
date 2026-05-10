---
title: "Pandas groupby Mastery: agg, transform, apply Explained"
description: "Stop reaching for apply() first. A practical guide to the three core groupby operations with benchmarks and interview-style problems."
date: "2026-05-02"
author: "PyPrepHub Editorial"
category: "Pandas"
tags: ["pandas", "groupby", "performance", "data-engineering"]
cover: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=80"
coverAlt: "Data tables and charts"
trending: true
featured: true
difficulty: "intermediate"
---

The `groupby` API in pandas is deceptively deep. Most bugs I see reviewing data pipelines come from using `apply` where `agg` or `transform` would be faster, safer, and clearer.

## The mental model

A `groupby` splits the frame into groups by key, applies a function to each group, and combines the results. The *shape* of what you apply determines which method to call.

| Method       | Function returns      | Output shape             |
|--------------|-----------------------|--------------------------|
| `agg`        | scalar per column     | one row per group        |
| `transform`  | same length as group  | same shape as input      |
| `apply`      | anything              | inferred (often slow)    |
| `filter`     | bool                  | subset of original rows  |

## agg: one row per group

```python
df.groupby("user_id").agg(
    total=("amount", "sum"),
    count=("amount", "size"),
    avg=("amount", "mean"),
    first_day=("ts", "min"),
)
```

Named aggregations (PEP 8 kwargs) are the modern idiom: clear column names, and pandas can vectorise every operation using C.

## transform: align an aggregate back to the rows

This is the feature most people miss. `transform` broadcasts the group's aggregate back to every row of that group:

```python
df["user_avg"] = df.groupby("user_id")["amount"].transform("mean")
df["deviation"] = df["amount"] - df["user_avg"]
```

No merge, no index juggling. Aliases like `"mean"`, `"sum"`, `"size"`, `"rank"` are vectorised and fast.

## apply: the escape hatch

`apply` runs a Python function per group. Use it only when you can't express the operation as `agg` or `transform`:

```python
def top_3_by_revenue(g: pd.DataFrame) -> pd.DataFrame:
    return g.nlargest(3, "revenue")

df.groupby("region", group_keys=False).apply(top_3_by_revenue)
```

This is `O(n log k)` per group and pure Python — fine for a few thousand groups, painful at a million.

## The benchmark that settles it

One million rows, ten thousand groups, compute `x - group_mean`:

```python
# 'transform' with a string alias
df["centered"] = df["x"] - df.groupby("g")["x"].transform("mean")
# 12 ms

# 'apply' with a lambda
df["centered"] = df.groupby("g")["x"].apply(lambda s: s - s.mean())
# 890 ms (74× slower)
```

The rule is: **if the string alias exists, use it**. `"sum"`, `"mean"`, `"cumsum"`, `"rank"` all dispatch to C code.

## Interview question: rolling per-group metric

> Compute a 7-day rolling sum of `amount` per user, keeping rows ordered by `ts`.

```python
df = df.sort_values(["user_id", "ts"])
df["rolling_7d"] = (
    df.groupby("user_id")
      .rolling("7D", on="ts")["amount"]
      .sum()
      .reset_index(level=0, drop=True)
)
```

Watch the index: `rolling` returns a MultiIndex with the group key. Drop it before assigning back to the original frame.

## Five production rules

1. **Prefer `agg` and `transform` over `apply`**. Hot paths only.
2. **Use named aggregations.** Self-documenting column names.
3. **Avoid `groupby(...).apply(lambda g: ...)`** in the hottest 10% of your code.
4. **Sort once, group many.** `sort_values` plus `groupby(..., sort=False)` is a common win.
5. **Check `observed=True`** when grouping on categoricals — otherwise pandas emits all categorical levels, even empty ones.

## Takeaway

Pick the method that matches the *output shape* you want. You'll write less code, it'll run faster, and it'll read better in review.
