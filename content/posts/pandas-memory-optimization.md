---
title: "Pandas Memory Optimization: Cut DataFrame Size by 80%"
description: "Stop paying float64 prices for int8 data. A checklist to shrink any DataFrame with zero loss of information."
date: "2026-05-01"
author: "PyPrepHub Editorial"
category: "Pandas"
tags: ["pandas", "performance", "memory", "data-engineering"]
cover: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=80"
coverAlt: "Data processing"
difficulty: "intermediate"
---

"My script ran out of memory." I have heard this sentence in every data team I've worked on. Nine times out of ten, the fix isn't a bigger machine — it's better dtypes.

## Start by measuring

```python
import pandas as pd
df = pd.read_csv("events.csv")

df.info(memory_usage="deep")
```

`memory_usage="deep"` is mandatory — the default mode lies about `object`-dtype columns (strings) because it only counts pointers, not the string payload itself.

```python
df.memory_usage(deep=True).sum() / 1e6   # MB
```

This one line gives you a number to beat.

## Downcast integers

By default, pandas reads integers as `int64` — eight bytes per value. If your column holds ages or counts, you're paying 4–8× too much:

```python
df["age"] = pd.to_numeric(df["age"], downcast="integer")
```

`downcast="integer"` picks the smallest signed dtype that fits (`int8`, `int16`, `int32`, `int64`). For non-negative columns, `"unsigned"` picks `uint*` and doubles your range at the same size.

## Downcast floats

```python
df["score"] = pd.to_numeric(df["score"], downcast="float")
```

`float32` has ~7 significant digits — fine for most ML features, not fine for money. Use your judgement.

## Convert strings to category

If a string column has high repetition (low cardinality), `category` is a dictionary-encoded representation that stores the unique values once plus small integer codes:

```python
df["country"] = df["country"].astype("category")
```

Rule of thumb: if `df["country"].nunique() / len(df) < 0.5`, convert. For 1M rows of country codes, this goes from ~80 MB to ~2 MB.

## Strings as PyArrow

For high-cardinality strings where `category` doesn't help, the PyArrow-backed string dtype beats `object`:

```python
df["message"] = df["message"].astype("string[pyarrow]")
```

You get faster `.str` operations and roughly 2× less memory — especially on short strings where Python's per-object overhead dominates.

## Parse dates once

`object`-dtype date strings are the #1 memory hog in a typical CSV:

```python
df["ts"] = pd.to_datetime(df["ts"], format="%Y-%m-%d %H:%M:%S")
```

Passing `format=` skips inference and is 10–50× faster. Once parsed, dates are 8 bytes each regardless of the string length they came from.

## Sparse columns

Columns that are mostly zero (or mostly NaN) waste memory storing the dominant value over and over:

```python
from pandas import SparseDtype
df["rare_flag"] = df["rare_flag"].astype(SparseDtype("int8", 0))
```

Only non-zero values are stored. Perfect for one-hot encoded dummies.

## A worked example

Starting point — 1M rows of event logs:

```python
df.memory_usage(deep=True).sum() / 1e6   # 312 MB
```

Apply the checklist:

```python
# 1. integers
df["user_id"] = pd.to_numeric(df["user_id"], downcast="unsigned")
df["count"]   = pd.to_numeric(df["count"],   downcast="unsigned")

# 2. floats
df["amount"]  = pd.to_numeric(df["amount"],  downcast="float")

# 3. categorical
for col in ["country", "plan", "device"]:
    df[col] = df[col].astype("category")

# 4. strings
df["raw_url"] = df["raw_url"].astype("string[pyarrow]")

# 5. dates
df["ts"] = pd.to_datetime(df["ts"], format="%Y-%m-%d %H:%M:%S")

df.memory_usage(deep=True).sum() / 1e6   # 58 MB — 81% smaller
```

Same data, same operations, five times more fits in RAM.

## Do it at read time

Once you know the right dtypes, skip the "read and then convert" round-trip by telling `read_csv` directly:

```python
df = pd.read_csv(
    "events.csv",
    dtype={
        "user_id": "uint32",
        "country": "category",
        "amount":  "float32",
    },
    parse_dates=["ts"],
)
```

This is 2–3× faster on large files because pandas doesn't materialise the wide dtypes first.

## Use the PyArrow engine for big reads

pandas 2.x+ ships with a full PyArrow backend. For CSV/Parquet at scale, it's dramatically faster:

```python
df = pd.read_csv("events.csv", engine="pyarrow", dtype_backend="pyarrow")
```

All columns become PyArrow-backed, which is usually (not always) faster and lighter.

## When optimisation *hurts*

- `category` on a high-cardinality column adds overhead instead of saving memory.
- `float32` accumulates numerical error in long reductions — keep `float64` for scientific pipelines.
- Rewriting dtypes inside a hot loop forces copies. Set dtypes at load time, not in the hot path.

## Takeaway

The fastest optimisation is the one you don't pay for at runtime. Declare correct dtypes at the point of ingestion and 80% of memory-shaped problems vanish. `info(memory_usage="deep")` is the only metric you need to know your progress.
