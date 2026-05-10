---
title: "Statistical Testing Primer for Engineers"
description: "P-values, confidence intervals, and the A/B test math your PM keeps asking about — explained without the jargon."
date: "2026-04-15"
author: "PyPrepHub Editorial"
category: "Data Science"
tags: ["statistics", "ab-testing", "hypothesis-testing", "data-science"]
cover: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&q=80"
coverAlt: "Statistics charts"
featured: true
difficulty: "intermediate"
---

Every engineer ships an experiment eventually. This is the minimum statistical toolkit to not embarrass yourself reading the results.

## What a p-value actually is

"The probability of seeing data at least as extreme as what we saw, if there were truly no effect."

Let's unpack that word-by-word:

- **"At least as extreme"** — we're summing the tail probability, not a point probability.
- **"If there were truly no effect"** — we compute it *assuming* the null hypothesis is true.
- **"Probability of the data"** — the p-value is a property of the data under an assumed world.

It is *not*:

- The probability that the null hypothesis is true. (Common mistake.)
- The probability that your effect is real. (Also wrong.)
- 1 minus the probability your experiment will replicate. (Very wrong.)

A p-value below 0.05 means: "if nothing were happening, seeing this or more extreme would happen less than 5% of the time." That's it.

## Type I vs. Type II errors

| Decision vs. reality | H₀ true (no effect)   | H₁ true (effect exists) |
|----------------------|-----------------------|-------------------------|
| Reject H₀            | **Type I (false +)**   | Correct               |
| Fail to reject H₀    | Correct               | **Type II (false −)** |

- **α (alpha)** — the Type I rate you accept. Typically 0.05.
- **β (beta)** — the Type II rate. **Power = 1 − β.**

Power is the probability of detecting a real effect. You set α by convention; you *design for* power. 80% is the usual target.

## t-test, in one breath

Comparing two means on numeric data:

```python
from scipy import stats

a = df[df.group == "A"].metric
b = df[df.group == "B"].metric

t, p = stats.ttest_ind(a, b, equal_var=False)   # Welch's t-test
```

Use `equal_var=False` by default — Welch's version doesn't assume equal variances and is rarely worse than Student's. Don't assume normality unless your sample size is small; the Central Limit Theorem covers you at n > 30 per group.

## A/B test math you should know

**Sample size.** For comparing two proportions with baseline `p`, minimum detectable effect `Δ`, α = 0.05, power = 0.8:

```
n per arm ≈ 16 × p(1 − p) / Δ²
```

At `p = 0.10`, `Δ = 0.01` (a 10% relative lift), you need ~14,400 per arm. Want to detect half the effect? You need 4× the sample.

**Confidence interval.** For a proportion:

```python
from statsmodels.stats.proportion import proportion_confint
ci_low, ci_high = proportion_confint(count=successes, nobs=n, method="wilson")
```

Prefer Wilson or Clopper-Pearson to the textbook normal approximation, especially near 0% or 100% where the normal-approx interval can go negative.

## Multiple testing correction

Run 20 A/A tests (no real effect) with α = 0.05 and on average one comes back "significant." That's the whole problem.

If you're checking multiple metrics or multiple segments:

- **Bonferroni.** Divide α by the number of tests. Simple, conservative.
- **Benjamini–Hochberg (FDR).** Controls the *false discovery rate* — less conservative, appropriate when you're OK with some wrong calls in a batch.

```python
from statsmodels.stats.multitest import multipletests
reject, pvals_corrected, _, _ = multipletests(pvals, alpha=0.05, method="fdr_bh")
```

Don't report 15 segment breakdowns without correction — that's where "interesting" findings become noise.

## Peeking kills experiments

Early peeking is the single biggest source of false positives in practice. Every time you glance at the dashboard and decide whether to stop, your effective α goes up:

- Peek once at day 3, run to day 7 → effective α ≈ 0.08.
- Peek daily for 7 days → effective α ≈ 0.15.

Fixes:

1. **Fix sample size up front.** Pick `n`, run to `n`, then look. Once.
2. **Sequential tests.** Group-sequential designs (Pocock, O'Brien-Fleming) allow planned interim looks with the correct α spending.
3. **Always-valid inference.** Bayesian A/B or confidence sequences (mSPRT) are designed for continuous monitoring.

## Confidence intervals beat p-values

Report both. A CI communicates magnitude and uncertainty; a p-value is a single bit (significant or not).

| Metric        | Group A    | Group B    | Lift (95% CI)       | p     |
|---------------|------------|------------|---------------------|-------|
| Conversion %  | 12.4%      | 13.1%      | +0.7pp (+0.2, +1.2) | 0.009 |

The CI tells you: the true lift is between +0.2pp and +1.2pp. That shape of statement is what drives product decisions. "p=0.009" alone doesn't.

## Practical checklist before trusting a result

1. **Randomisation worked.** Group sizes are within a few percent; pre-treatment covariates look similar (SRM test).
2. **Sample size met.** Not "close enough" — actually met.
3. **Primary metric chosen in advance.** Not selected after seeing which one moved.
4. **No peeking.** Or correct sequential-testing adjustment.
5. **Effect size is practically meaningful**, not just statistically significant.
6. **Segments weren't rummaged.** Or you applied FDR correction.

If any of these fail, downgrade the certainty of your conclusion.

## Takeaway

You don't need graduate statistics to read experiment results correctly, but you do need to understand what a p-value isn't, how multiple comparisons inflate error, and why peeking is the single biggest real-world mistake. Focus on those three and you'll outperform most teams.
