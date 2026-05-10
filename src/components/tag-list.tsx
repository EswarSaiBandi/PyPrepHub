import Link from 'next/link'

export function TagList({ tags }: { tags: string[] }) {
  if (!tags.length) return null
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((t) => (
        <Link key={t} href={`/tag/${t}`} className="chip">#{t}</Link>
      ))}
    </div>
  )
}
