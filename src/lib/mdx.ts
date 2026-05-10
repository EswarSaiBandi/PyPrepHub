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

function extractHeadings() {
  return (tree: unknown, file: { data: Record<string, unknown> }) => {
    const headings: Heading[] = []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    visit(tree as any, 'element', (node: any) => {
      if (!/^h[2-4]$/.test(node.tagName)) return
      const level = Number(node.tagName[1])
      const id = node.properties?.id as string | undefined
      const text = flattenText(node)
      if (id && text) headings.push({ id, text, level })
    })
    file.data.headings = headings
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function flattenText(node: any): string {
  if (node.type === 'text') return node.value as string
  if (!node.children) return ''
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
