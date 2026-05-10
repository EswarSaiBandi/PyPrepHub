import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrettyCode, { type Options as PrettyCodeOptions } from 'rehype-pretty-code'
import rehypeStringify from 'rehype-stringify'
import { visit } from 'unist-util-visit'
import type { Heading } from './types'

const prettyCodeOptions: PrettyCodeOptions = {
  theme: { dark: 'github-dark-dimmed', light: 'github-light' },
  keepBackground: false,
  defaultLang: 'plaintext',
}

interface HastNode {
  type: string
  tagName?: string
  value?: string
  properties?: { id?: string } & Record<string, unknown>
  children?: HastNode[]
}

function extractHeadings() {
  return (tree: unknown, file: { data: Record<string, unknown> }) => {
    const headings: Heading[] = []
    visit(tree as never, 'element', (node) => {
      const n = node as HastNode
      if (!n.tagName || !/^h[2-4]$/.test(n.tagName)) return
      const level = Number(n.tagName[1])
      const id = n.properties?.id
      const text = flattenText(n)
      if (id && text) headings.push({ id, text, level })
    })
    file.data.headings = headings
  }
}

function flattenText(node: HastNode): string {
  if (node.type === 'text' && typeof node.value === 'string') return node.value
  if (!node.children) return ''
  return node.children.map(flattenText).join('')
}

export async function renderMarkdown(
  markdown: string,
): Promise<{ html: string; headings: Heading[] }> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: 'append',
      properties: { className: ['heading-anchor'], 'aria-label': 'Link to section' },
      content: {
        type: 'element',
        tagName: 'span',
        properties: { className: ['sr-only'] },
        children: [{ type: 'text', value: '#' }],
      },
    })
    .use(extractHeadings)
    .use(rehypePrettyCode, prettyCodeOptions)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown)

  const headings = (file.data.headings as Heading[] | undefined) ?? []
  return { html: String(file), headings }
}
