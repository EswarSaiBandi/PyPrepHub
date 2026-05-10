---
title: "SQL CTEs and Recursive Queries, Explained"
description: "CTEs make complex queries readable. Recursive CTEs let you traverse graphs and hierarchies. Here's when to reach for each."
date: "2026-04-29"
author: "PyPrepHub Editorial"
category: "SQL"
tags: ["sql", "cte", "recursion", "interview"]
cover: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1600&q=80"
coverAlt: "SQL query"
difficulty: "intermediate"
---

A Common Table Expression — CTE — is a named query you can reference later in the same statement. It's the single most effective tool for making gnarly SQL readable.

## Non-recursive CTEs: the readable form

Compare two ways to write "give me users who spent more than the monthly average":

```sql
-- Nested subquery
SELECT user_id, spend
FROM   orders o
WHERE  spend > (
    SELECT AVG(spend) FROM orders WHERE MONTH(ts) = MONTH(o.ts)
);

-- CTE version
WITH monthly_avg AS (
    SELECT MONTH(ts) AS month, AVG(spend) AS avg_spend
    FROM   orders
    GROUP  BY MONTH(ts)
)
SELECT o.user_id, o.spend
FROM   orders o
JOIN   monthly_avg m ON MONTH(o.ts) = m.month
WHERE  o.spend > m.avg_spend;
```

The CTE version is longer, but each step has a name. When the query grows, that naming is worth ten subqueries.

## Chaining CTEs

Multiple CTEs read top-to-bottom, each seeing the ones above:

```sql
WITH active_users AS (
    SELECT id FROM users WHERE last_login > CURRENT_DATE - INTERVAL '30 days'
),
high_spenders AS (
    SELECT user_id FROM orders
    WHERE  user_id IN (SELECT id FROM active_users)
    GROUP  BY user_id
    HAVING SUM(amount) > 1000
)
SELECT u.*
FROM   users u
JOIN   high_spenders h ON u.id = h.user_id;
```

Breaking a query into named steps is how you stay sane when the result set needs three layers of filtering.

## CTEs aren't free (sometimes)

Historically, some databases *materialised* every CTE — meaning they computed and stored the intermediate set before the outer query could see it. That's a performance trap if the CTE is selective.

As of 2026:

- **PostgreSQL** ≥ 12 inlines CTEs by default (you can force materialisation with `WITH foo AS MATERIALIZED (...)`).
- **MySQL 8+** inlines.
- **SQL Server** has always inlined.
- **BigQuery** treats CTEs as inline views — re-computed each time they're referenced.

Check `EXPLAIN` on any CTE you care about.

## Recursive CTEs: the hierarchy hammer

The real power move is `WITH RECURSIVE`. The syntax has two parts glued by `UNION ALL`:

1. **Anchor query** — the seed rows.
2. **Recursive query** — refers back to the CTE name, producing the next layer.

The engine repeats step 2, feeding new rows back in, until it produces zero rows.

## Classic example: org chart

Given `employees(id, manager_id, name)`, get everyone under Alice:

```sql
WITH RECURSIVE reports AS (
    -- Anchor: Alice herself
    SELECT id, manager_id, name, 0 AS depth
    FROM   employees
    WHERE  name = 'Alice'

    UNION ALL

    -- Recursive: employees whose manager is already in reports
    SELECT e.id, e.manager_id, e.name, r.depth + 1
    FROM   employees e
    JOIN   reports   r ON e.manager_id = r.id
)
SELECT * FROM reports ORDER BY depth, name;
```

Read the `JOIN reports r` as "anyone reporting to someone we already found." Each iteration adds one more layer of depth.

## Classic example: generate a date series

When you need one row per day between two dates and your DB doesn't have `generate_series`:

```sql
WITH RECURSIVE days AS (
    SELECT DATE '2026-01-01' AS d
    UNION ALL
    SELECT d + INTERVAL '1 day' FROM days WHERE d < DATE '2026-01-31'
)
SELECT d FROM days;
```

Postgres has `generate_series` — use it. SQL Server and MySQL don't; the recursive CTE is the portable answer.

## Classic example: shortest path between users

Given a friendship graph, find path length between A and B:

```sql
WITH RECURSIVE paths(src, dst, len) AS (
    SELECT src, dst, 1 FROM friendships
    UNION ALL
    SELECT p.src, f.dst, p.len + 1
    FROM   paths p
    JOIN   friendships f ON p.dst = f.src
    WHERE  p.len < 6                -- bail out at 6 hops
)
SELECT MIN(len) FROM paths
WHERE  src = 'alice' AND dst = 'bob';
```

**Always include a termination guard.** Recursive CTEs on cycle-containing graphs loop forever; a depth cap or a "not yet seen" filter is mandatory.

## Interview question: gaps between integers

> Given a table of distinct integers, return the ranges of consecutive runs. `[1,2,3,5,7,8]` → `[(1,3), (5,5), (7,8)]`.

```sql
WITH numbered AS (
    SELECT n, n - ROW_NUMBER() OVER (ORDER BY n) AS grp
    FROM   ints
)
SELECT MIN(n) AS start_, MAX(n) AS end_
FROM   numbered
GROUP  BY grp
ORDER  BY start_;
```

No recursion needed — the trick is that consecutive integers produce the *same* `n - row_number`, so you can `GROUP BY` it. This "gaps and islands" pattern shows up in half of all interview SQL problems.

## Performance notes

- Recursive CTEs are iterative under the hood. Big depths are slow.
- Add `LIMIT` or a depth cap in the recursive step for safety.
- If you need transitive closure on a large graph, a dedicated graph database or a `LATERAL` join approach may be faster — profile first.
- `UNION` (without `ALL`) deduplicates on every iteration and is slower; `UNION ALL` is the default for good reason.

## Takeaway

Reach for a CTE whenever your query has a step that needs a name. Reach for `WITH RECURSIVE` whenever you have a parent-child or graph traversal. The readability gain alone justifies both — and on the right problems, recursive CTEs let you do in ten lines what would otherwise need application code.
