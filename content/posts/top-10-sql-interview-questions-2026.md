---
title: "Top 10 SQL Interview Questions (2026 Edition)"
description: "Ten SQL problems we actually ask in data interviews, with clean solutions, common traps, and the follow-up questions to expect."
date: "2026-04-19"
author: "PyPrepHub Editorial"
category: "Interviews"
tags: ["sql", "interview", "challenge", "window-functions"]
cover: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1600&q=80"
coverAlt: "SQL editor"
featured: true
trending: true
difficulty: "intermediate"
---

The SQL round is where strong data candidates separate from shaky ones. These ten problems — or close cousins — show up constantly. Each is solvable in under ten lines if you know the right pattern.

## 1. Second-highest salary

> Find the second-highest distinct salary.

```sql
SELECT DISTINCT salary
FROM   employees
ORDER  BY salary DESC
OFFSET 1 ROWS
FETCH  NEXT 1 ROWS ONLY;
```

Or using a window:

```sql
WITH r AS (
    SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
    FROM   employees
)
SELECT salary FROM r WHERE rnk = 2;
```

**Trap:** if you use `RANK()` instead of `DENSE_RANK()`, ties at #1 skip #2 entirely and you return nothing.

## 2. Nth-highest per group

> Top 3 highest-paid employees per department.

```sql
SELECT *
FROM (
    SELECT e.*, DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS drnk
    FROM   employees e
) t
WHERE drnk <= 3;
```

Switch to `ROW_NUMBER()` if you want *strictly* three rows even when there are ties.

## 3. Running total

> Running total of daily revenue.

```sql
SELECT
    day,
    revenue,
    SUM(revenue) OVER (ORDER BY day
                       ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total
FROM daily;
```

Without the explicit `ROWS BETWEEN` frame, some databases default to `RANGE` which can behave unexpectedly with duplicate order keys. Always be explicit.

## 4. Gaps and islands

> Given `logins(user_id, day)` rows, return the start and end of each consecutive streak.

```sql
WITH grouped AS (
    SELECT
        user_id,
        day,
        day - INTERVAL '1 day' * ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY day) AS grp
    FROM logins
)
SELECT user_id, MIN(day) AS start_, MAX(day) AS end_
FROM   grouped
GROUP  BY user_id, grp;
```

Consecutive days have the same `day - row_number` offset, so `GROUP BY` collapses each streak. This is the template for *any* consecutive-run problem.

## 5. Day-over-day change

> Percent change in daily revenue vs. previous day.

```sql
SELECT
    day,
    revenue,
    LAG(revenue) OVER (ORDER BY day) AS prev,
    100.0 * (revenue - LAG(revenue) OVER (ORDER BY day)) / NULLIF(LAG(revenue) OVER (ORDER BY day), 0) AS pct_change
FROM daily;
```

`NULLIF(x, 0)` guards against divide-by-zero when yesterday's revenue was 0.

## 6. Median

> Median order value.

```sql
-- Postgres / standard SQL
SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount) AS median
FROM   orders;
```

If your DB doesn't have `PERCENTILE_CONT`:

```sql
WITH ranked AS (
    SELECT
        amount,
        ROW_NUMBER() OVER (ORDER BY amount) AS rn,
        COUNT(*) OVER () AS n
    FROM orders
)
SELECT AVG(amount) AS median
FROM   ranked
WHERE  rn IN ((n + 1) / 2, (n + 2) / 2);
```

## 7. Remove duplicates, keep first

> Same row appears multiple times; keep the earliest.

```sql
WITH numbered AS (
    SELECT e.*, ROW_NUMBER() OVER (PARTITION BY user_id, event ORDER BY ts) AS rn
    FROM   events e
)
DELETE FROM events
WHERE  id IN (SELECT id FROM numbered WHERE rn > 1);
```

Use `PARTITION BY` on the columns that define "duplicate", `ORDER BY` on a tie-breaker (usually timestamp).

## 8. Exists vs. not-exists (anti-join)

> Users who never placed an order.

```sql
SELECT u.id
FROM   users u
WHERE  NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);
```

**Why not `NOT IN`?** If the subquery returns `NULL`, `NOT IN` returns `NULL` for every row — silently giving you zero results. `NOT EXISTS` handles NULLs correctly.

## 9. Pivot a column into rows

> Each user has `ts` visits; report per-user first, second, third visit as columns.

```sql
SELECT
    user_id,
    MAX(CASE WHEN rn = 1 THEN ts END) AS first_visit,
    MAX(CASE WHEN rn = 2 THEN ts END) AS second_visit,
    MAX(CASE WHEN rn = 3 THEN ts END) AS third_visit
FROM (
    SELECT user_id, ts, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY ts) AS rn
    FROM   visits
) t
GROUP BY user_id;
```

The `CASE` + `MAX` + `GROUP BY` pattern is the portable pivot. Don't reach for vendor-specific `PIVOT` syntax in interviews.

## 10. Sessionisation

> A session ends after 30 minutes of inactivity. Label each event with its session id.

```sql
WITH flagged AS (
    SELECT
        user_id,
        ts,
        CASE
          WHEN ts - LAG(ts) OVER (PARTITION BY user_id ORDER BY ts) > INTERVAL '30 minutes'
               OR LAG(ts) OVER (PARTITION BY user_id ORDER BY ts) IS NULL
          THEN 1 ELSE 0
        END AS new_session
    FROM events
)
SELECT
    user_id, ts,
    SUM(new_session) OVER (PARTITION BY user_id ORDER BY ts) AS session_id
FROM flagged;
```

"Flag boundaries, sum the flags" — one of the highest-leverage SQL patterns you can memorise.

## What interviewers actually watch for

Beyond getting the right answer, strong candidates:

- **Ask what "highest" means** — across all time? This year? Per region?
- **Confirm the schema** — "primary key? nullability? unique constraints?"
- **Reach for window functions first**, not self-joins.
- **Name their CTEs** with intent (`flagged`, `ranked`, `grouped`), not `t` or `x`.
- **Mention the edge cases** — empty tables, ties, NULLs — even if the written solution doesn't handle them.

## Takeaway

Ten patterns cover an enormous fraction of interview SQL. Learn them cold, know the traps (`RANK` vs `DENSE_RANK`, `NOT IN` vs `NOT EXISTS`, `RANGE` vs `ROWS`), and walk in with a clear answer template — "first I'll rank by X, then filter to Y." That template *is* the interview skill.
