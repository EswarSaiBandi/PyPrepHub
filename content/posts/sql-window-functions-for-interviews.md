---
title: "SQL Window Functions: The Interview Cheatsheet"
description: "ROW_NUMBER, RANK, LAG, LEAD, and running totals — the six windows you need to walk into any SQL interview prepared."
date: "2026-04-28"
author: "PyPrepHub Editorial"
category: "SQL"
tags: ["sql", "window-functions", "interview", "challenge"]
cover: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1600&q=80"
coverAlt: "Database query"
featured: true
trending: true
difficulty: "intermediate"
---

Every data interview loop I've sat on has at least one window-function question. They trip people up because the syntax looks noisy — but the model is tiny.

## The anatomy

```sql
FUNCTION() OVER (
    PARTITION BY <cols>     -- split rows into groups
    ORDER BY <cols>         -- order inside the group
    ROWS BETWEEN ... AND ...-- frame (optional)
)
```

- **PARTITION BY** is optional. Omit it and the whole result set is one partition.
- **ORDER BY** is required by some functions (`ROW_NUMBER`, `RANK`, `LAG`) and optional for others (`SUM`).
- **Frame** (`ROWS`/`RANGE`) defaults to "all rows from the start of the partition to the current row" when `ORDER BY` is present.

## The six you must know

### 1. ROW_NUMBER — "rank strictly"

```sql
SELECT
    user_id,
    event_ts,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY event_ts) AS event_n
FROM events;
```

Numbers restart at 1 per user. Ties get different numbers — use `ORDER BY` tiebreakers to make it deterministic.

### 2. RANK / DENSE_RANK — "rank with ties"

```sql
SELECT
    department,
    employee,
    salary,
    RANK()       OVER (PARTITION BY department ORDER BY salary DESC) AS rnk,
    DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS drnk
FROM employees;
```

If two employees tie at rank 1, `RANK` skips to 3 for the next row, `DENSE_RANK` does not.

### 3. LAG / LEAD — "compare to a neighbor"

```sql
SELECT
    order_id,
    amount,
    LAG(amount)  OVER (PARTITION BY user_id ORDER BY order_ts) AS prev_amount,
    LEAD(amount) OVER (PARTITION BY user_id ORDER BY order_ts) AS next_amount
FROM orders;
```

Perfect for day-over-day changes, session detection, and churn signals.

### 4. Running total — "accumulate forward"

```sql
SELECT
    user_id,
    ts,
    amount,
    SUM(amount) OVER (
        PARTITION BY user_id
        ORDER BY ts
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS cumulative
FROM purchases;
```

The frame spells out what "running" means. `ROWS BETWEEN 6 PRECEDING AND CURRENT ROW` is a 7-row rolling window.

### 5. NTILE — "bucket into quantiles"

```sql
SELECT user_id, spend, NTILE(4) OVER (ORDER BY spend DESC) AS quartile
FROM users;
```

Hand-rolled deciles without a `CASE` tower.

### 6. FIRST_VALUE / LAST_VALUE — "session boundaries"

```sql
SELECT
    user_id,
    session_id,
    event,
    ts,
    FIRST_VALUE(event) OVER (PARTITION BY session_id ORDER BY ts) AS first_event
FROM events;
```

**Trap:** `LAST_VALUE` with the default frame returns the current row, not the partition's last row. Fix it:

```sql
LAST_VALUE(event) OVER (
    PARTITION BY session_id ORDER BY ts
    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
) AS last_event
```

## Classic interview problem: top-N per group

> Return the three highest-paid employees in each department.

```sql
WITH ranked AS (
    SELECT *,
           DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS drnk
    FROM employees
)
SELECT * FROM ranked WHERE drnk <= 3;
```

Use `ROW_NUMBER` if you want strictly three rows, `DENSE_RANK` if you want to include ties at rank 3.

## Classic interview problem: gaps in a user session

> A session ends after 30 minutes of inactivity. Return each row labelled with its session id.

```sql
WITH gaps AS (
    SELECT
        user_id,
        ts,
        CASE
          WHEN ts - LAG(ts) OVER (PARTITION BY user_id ORDER BY ts) > INTERVAL '30 minutes'
               OR LAG(ts) OVER (PARTITION BY user_id ORDER BY ts) IS NULL
          THEN 1 ELSE 0
        END AS is_new_session
    FROM events
)
SELECT
    user_id,
    ts,
    SUM(is_new_session) OVER (PARTITION BY user_id ORDER BY ts) AS session_id
FROM gaps;
```

The "flag new session, then sum the flags" pattern shows up in dozens of interview questions. Memorise it.

## Takeaway

Windows aren't a feature you reach for — they're the default shape of most analytical queries. Five minutes internalising `PARTITION BY`, `ORDER BY`, and the `ROWS` frame will unlock the next three interviews you sit.
