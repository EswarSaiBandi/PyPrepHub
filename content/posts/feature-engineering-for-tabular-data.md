---
title: "Feature Engineering for Tabular Data, In Practice"
description: "Eight patterns that consistently beat raw features on tabular ML problems — with leakage-free implementation notes."
date: "2026-04-10"
author: "PyPrepHub Editorial"
category: "Data Science"
tags: ["feature-engineering", "data-science", "sklearn", "tabular"]
cover: "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=1600&q=80"
coverAlt: "Data pipeline"
trending: true
difficulty: "intermediate"
---

Despite every "deep learning ate tabular" claim, the uncomfortable truth is that gradient-boosted trees on well-engineered features still win most business problems. Here are the patterns that consistently pay off.

## 1. Target encoding for high-cardinality categoricals

One-hot encoding a column with 10,000 values explodes your feature space. Target encoding replaces each category with its (smoothed) target mean:

```python
from category_encoders import TargetEncoder
enc = TargetEncoder(cols=["zipcode"], smoothing=10)
X_train_enc = enc.fit_transform(X_train, y_train)
X_valid_enc = enc.transform(X_valid)
```

**Leakage warning.** If you fit the encoder on `(X_train, y_train)` and use it on `X_train` before cross-validation, every row has seen its own label. Always fit inside your CV pipeline, never before.

Smoothing is essential — rare categories shouldn't be trusted to their own raw mean. The `smoothing` parameter biases the encoding toward the global mean for low-count groups.

## 2. Frequency encoding

For IDs and categories where the *count* is itself informative (power users, common products):

```python
freq = X_train["user_id"].value_counts(normalize=True)
X_train["user_id_freq"] = X_train["user_id"].map(freq)
X_valid["user_id_freq"] = X_valid["user_id"].map(freq).fillna(0)
```

Cheap, no leakage (frequencies come from `X_train` only), and often shockingly predictive on its own.

## 3. Datetime features — cyclical encoding

Hour of day, day of week, and month are *circular*. Treating them as integers tells the model that Sunday (6) and Monday (0) are as far apart as possible, which is backwards.

```python
import numpy as np
df["hour_sin"] = np.sin(2 * np.pi * df["hour"] / 24)
df["hour_cos"] = np.cos(2 * np.pi * df["hour"] / 24)
```

Now hour 23 and hour 0 are close in `(sin, cos)` space. Tree-based models don't strictly need this (they can learn the discontinuity), but linear models and neural nets benefit a lot.

## 4. Log-transform heavy-tailed numerics

Prices, counts, durations — anything with a long right tail — are easier for linear models when log-transformed:

```python
df["log_price"] = np.log1p(df["price"])
```

`np.log1p(x)` is `log(1 + x)` — safe when `x` can be zero.

Tree models are invariant to monotonic transforms, so this mostly helps linear/NN models. But it still helps visualisation and feature selection even for trees.

## 5. Interaction features

Cross two columns to let simple models capture non-linear combinations:

```python
df["price_per_sqft"] = df["price"] / df["sqft"]
df["age_x_income"]   = df["age"] * df["income"]
```

Domain knowledge beats automation here. Random pair-wise interactions are noise. *Meaningful* ratios (price-per-unit, events-per-session, conversion-per-visit) tend to be among the top features in a final model.

## 6. Aggregation features (the biggest win)

For any row with an entity (user, product, merchant), aggregate *across the entity* and join back:

```python
user_stats = (
    df_train.groupby("user_id")
            .agg(
                user_mean_spend=("amount", "mean"),
                user_count=("amount", "size"),
                user_max_spend=("amount", "max"),
            )
            .reset_index()
)
df_train = df_train.merge(user_stats, on="user_id", how="left")
df_valid = df_valid.merge(user_stats, on="user_id", how="left")
```

**Leakage warning.** Compute aggregations from `df_train` only. Computing `user_mean_spend` on the full dataset lets the model peek at validation labels through the aggregates.

For time-series data, aggregates must also be *past-only* — use an expanding or rolling window with shift(1) to exclude the current row.

## 7. Binning and quantile features

Useful for capturing "is this value unusual" without assuming linearity:

```python
df["income_quintile"] = pd.qcut(df["income"], q=5, labels=False)
```

Pair with target encoding on the bin and you get a non-linear feature that's still linear-model-friendly.

## 8. Missingness as a signal

Don't blindly impute. The *fact* that a value is missing is often predictive:

```python
df["age_missing"] = df["age"].isna().astype("int8")
df["age"] = df["age"].fillna(df["age"].median())
```

Credit bureaus learned this decades ago — missing income is a feature, not just a problem.

## Putting it in a leakage-free pipeline

```python
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from category_encoders import TargetEncoder
from lightgbm import LGBMClassifier

pre = ColumnTransformer([
    ("num", Pipeline([
        ("impute", SimpleImputer(strategy="median", add_indicator=True)),
        ("scale",  StandardScaler()),
    ]), num_cols),
    ("cat", TargetEncoder(smoothing=10), cat_cols),
])

model = Pipeline([
    ("pre", pre),
    ("clf", LGBMClassifier(n_estimators=500, learning_rate=0.05)),
])
```

The crucial property: every transformer fits **inside** cross-validation, so target encodings are computed from the training fold only.

## When to stop engineering features

Diminishing returns hit fast. Two signals to stop:

1. **Validation score is plateauing.** Each new feature adds <0.5% of your target metric.
2. **You're out of real-world ideas.** Random column-crossing is a losing strategy.

At that point, your remaining gains are from better models, more data, or tuning — not more features.

## Takeaway

Tabular ML still rewards carefully built features. Target/frequency encodings for high-cardinality, cyclical for time, log for heavy tails, aggregations per entity, and missingness flags — in that rough priority order — will put you ahead of 90% of model submissions on any real tabular problem. Just keep everything inside a leak-proof pipeline.
