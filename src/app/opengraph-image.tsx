import { ImageResponse } from 'next/og'
import { siteConfig } from '@/lib/site'

export const runtime = 'edge'
export const alt = siteConfig.name
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0e1019 0%, #112a58 50%, #1870f5 100%)',
          padding: '80px',
          color: 'white',
          fontFamily: 'system-ui',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #2f8cff, #1358de)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 28,
            }}
          >
            Py
          </div>
          <span style={{ fontSize: 28, fontWeight: 700, opacity: 0.9 }}>{siteConfig.name}</span>
        </div>
        <div style={{ marginTop: 40, fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>
          Ace your next data interview.
        </div>
        <div style={{ marginTop: 24, fontSize: 28, opacity: 0.8, maxWidth: 960 }}>
          Python · Pandas · NumPy · SQL · Machine Learning · AI
        </div>
      </div>
    ),
    size,
  )
}
