---
title: "Cross-Validation Strategies for Tabular Data"
description: "K-fold is the default, not the answer. Picking the right CV scheme for time-series, grouped, and imbalanced data — with the leakage traps that kill real models."
date: "2026-04-25"
author: "PyPrepHub Editorial"
category: "Machine Learning"
tags: ["machine-learning", "cross-validation", "evaluation", "sklearn"]
cover: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=80"
coverAlt: "Cross validation chart"
featured: true
difficulty: "intermediate"
---

"I got 0.95 AUC in cross-validation but 0.72 in production." In my experience this means one of three things: the CV scheme leaked, the training distribution didn't match production, or both. This post is about the first.

## The default: K-Fold

```python
from sklearn.model_selection import KFold, cross_val_score

cv = KFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(model, X, y, cv=cv, scoring="roc_auc")
```

Split rows into `k` groups; train on `k-1` groups, validate on the held-out group; rotate; average. Works when your rows are independent.

That "independent" clause is load-bearing — and the source of nearly every CV disaster.

## When K-Fold lies

K-fold assumes rows are iid (independent and identically distributed). In real data they usually aren't:

1. **Time series.** Future depends on past. A random shuffle leaks tomorrow into yesterday.
2. **Multiple rows per entity.** Multiple orders per user, multiple measurements per patient. A random split puts some rows of user A in train, others in validation — the model memorises A and scores inflate.
3. **Imbalanced classes.** A tiny positive class may land entirely in one fold. Validation AUC becomes noise.

Each of these demands a different CV strategy.

## Stratified K-Fold (imbalance)

```python
from sklearn.model_selection import StratifiedKFold
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
```

Preserves the class ratio in every fold. Use it as the default for any classification problem where classes are unbalanced, even mildly. Costs nothing extra.

## Time-Series Split

```python
from sklearn.model_selection import TimeSeriesSplit
cv = TimeSeriesSplit(n_splits=5)
```

Expanding-window splits: train on [0..t], validate on [t..t+h], roll forward. You never see the future.

In practice you want three tweaks:

- **Gap.** Add a buffer so training data doesn't touch the validation set: `TimeSeriesSplit(n_splits=5, gap=7)`.
- **Max train size.** For drifting distributions, cap training history: `max_train_size=365`.
- **Validate on the same length as production inference.** If you predict one week ahead in prod, validate on one-week windows.

## Group K-Fold (multiple rows per entity)

```python
from sklearn.model_selection import GroupKFold
cv = GroupKFold(n_splits=5)
scores = cross_val_score(model, X, y, cv=cv, groups=df["user_id"])
```

All rows for a given user (or patient, session, device) stay together. This is mandatory for any problem where your production setting asks "how does the model do on *users the training didn't see?*".

A combined form — `StratifiedGroupKFold` — preserves class ratios while keeping groups together. It's the right default for most business-facing classifiers.

## The seven leakage traps

Even with the right CV shape, leakage creeps in via preprocessing:

1. **Fitting a scaler on the full `X`** — the mean/std includes test data.
2. **Target encoding on the full frame** — test labels influence train encodings.
3. **Imputation using global statistics** — same problem.
4. **Feature selection on the full `y`** — correlation-based selection biased by test signal.
5. **Oversampling (SMOTE) before the split** — synthetic training rows derived from test rows.
6. **Ordering features by time then shuffling** — breaks time-series assumption silently.
7. **Using future-known aggregates** — "number of orders by this user ever" includes the future when computed naïvely.

The fix is the same for all seven: **wrap every preprocessing step in a `Pipeline`** so sklearn refits them inside each fold.

```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

pipe = Pipeline([
    ("scale", StandardScaler()),
    ("clf",   LogisticRegression()),
])

scores = cross_val_score(pipe, X, y, cv=cv, scoring="roc_auc")
```

Now `StandardScaler` is fit on training folds only. The model can't cheat.

## Nested CV for honest hyperparameter tuning

When you tune hyperparameters via cross-validation, the resulting score is biased — you've peeked at each fold while choosing. Nested CV fixes it:

```python
from sklearn.model_selection import GridSearchCV, cross_val_score

inner = KFold(5)
outer = KFold(5)

search = GridSearchCV(pipe, param_grid, cv=inner, scoring="roc_auc")
scores = cross_val_score(search, X, y, cv=outer, scoring="roc_auc")
```

`search` picks hyperparameters on the inner loop; `outer` evaluates them on held-out data the inner loop never saw. The cost is `n_inner × n_outer` fits — 25× in this example.

If that's too expensive, a defensible middle ground is: tune on CV, then report the final score on a held-out test set that *never* entered the tuning loop.

## Interview question: why is my AUC dropping in production?

Candidate answer template:

1. **CV mismatch.** Was validation random-shuffled over time-series, or grouped incorrectly?
2. **Leakage in preprocessing.** Were scalers/encoders fit before the split?
3. **Distribution shift.** Has the input distribution drifted since training?
4. **Label noise.** Is production ground-truth measured the same way as training?
5. **Prevalence shift.** Has the positive rate changed? AUC is robust to class balance; PR-AUC and precision are not.

Ranking these by probability in most real settings: 1 > 2 > 3 > 5 > 4.

## Takeaway

K-fold is the default; it's rarely the right default. The CV scheme should mirror how the model will be used. When your training CV score and your production metric don't match, the first place to look is the CV itself — before blaming the model, the features, or the world.
