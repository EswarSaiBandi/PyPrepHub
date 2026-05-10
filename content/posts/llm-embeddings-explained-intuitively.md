---
title: "LLM Embeddings, Intuitively"
description: "What embeddings are, what they aren't, and how to reason about them when you're debugging a retrieval system."
date: "2026-04-12"
author: "PyPrepHub Editorial"
category: "AI"
tags: ["ai", "embeddings", "rag", "nlp", "interview"]
cover: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1600&q=80"
coverAlt: "Vector visualization"
trending: true
difficulty: "intermediate"
---

Embeddings are the least-glamorous, most-load-bearing part of every modern retrieval system. They're also one of the most commonly misunderstood — even by people who ship them.

## What an embedding actually is

An embedding is a fixed-length vector of real numbers that represents a piece of input (word, sentence, image, row of a table) in a way where *similar inputs produce geometrically close vectors*.

"Close" is a choice: typically cosine similarity or inner product. The vector itself is meaningless — only distances and directions carry signal.

## What an embedding is *not*

- **Not a summary.** You cannot decode a sentence from its embedding, the way you can from an autoencoder's latent. Modern embeddings keep information needed for *similarity judgements*, not reconstruction.
- **Not cross-model comparable.** Vectors from OpenAI `text-embedding-3-large` and Cohere `embed-english-v3` live in different spaces. Cosine-similarity numbers are incomparable across models.
- **Not a single ranking.** `sim(A, B) = 0.82` is not inherently good or bad. The distribution of similarities is model-dependent — always calibrate thresholds on your own evals.

## The three failure modes in RAG

When a retrieval-augmented system returns garbage, it is almost always one of these:

### 1. Chunking is wrong

If a "document" in your index is 8,000 tokens, the embedding is dominated by high-frequency noise. If it's 20 tokens, you fragment meaning. Most teams converge on 200–800 tokens with ~15% overlap.

### 2. The query and documents live in different distributions

The classic example: your documents are formal product docs, your queries are short, typo-laden user questions. Naïve cosine similarity between the two will surface documents that share surface forms with the query, not ones that answer it. Mitigations:

- **Query rewriting.** Ask an LLM to expand the user query into 3–5 paraphrases before embedding.
- **HyDE** (Hypothetical Document Embeddings). Ask an LLM to draft a hypothetical answer, embed *that*, and use it as the query vector.
- **Two-stage retrieval.** Use embeddings for recall, a cross-encoder (or reranker) for precision on the top-50.

### 3. You're using one score when you need two

Embedding similarity captures *topical* relevance. It does not capture:

- Recency (when freshness matters)
- Authority (a wiki stub vs. the canonical doc)
- User-specific signals (their team, language, prior queries)

Real production retrieval combines embedding score + BM25 + business-logic features, usually via a learned reranker.

## A mental model: nearest neighbour over a compressed space

An embedding model is trained so that `||e(A) - e(B)||` tracks *human judgement* of "are A and B about the same thing?" for some dataset. That's it.

The consequences are simple:

- If your task's notion of similarity matches the training distribution, embeddings look magical.
- If it doesn't — say you're matching legal clauses by *effect* rather than topic — off-the-shelf embeddings will miss, and no amount of index tuning will save you. You need a domain-specific model.

## Interview question: cosine vs dot product

> What's the difference between cosine similarity and dot product, and when does it matter?

Cosine similarity normalises the vectors first: `cos(u, v) = u·v / (||u|| ||v||)`. For unit-length vectors (many modern embedding APIs return them), cosine and dot product are identical.

If your embeddings are *not* normalised, dot product has an implicit popularity bias — longer-norm vectors win regardless of direction. This is why systems like dense retrievers almost always L2-normalise.

## Practical checklist before you debug your index

1. Are you using the *same model* for queries and documents?
2. Are vectors L2-normalised if you're using cosine/dot?
3. Have you eyeballed 20 wrong retrievals and identified the dominant failure mode?
4. Does the reranker see the top-50 (or top-100) and not just the top-5?
5. Have you logged per-query latency, recall@k, and reranker-overturn rate to a dashboard?

Almost every "the embeddings are bad" conclusion, on inspection, is actually one of the items above.

## Takeaway

Embeddings are geometry. Most production retrieval problems are not solved by changing the model; they're solved by fixing the chunks, the query, or the ranking stage. Know your distances, calibrate on your data, and keep a reranker in your back pocket.
