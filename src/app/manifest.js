export const dynamic = 'force-static';

export default function manifest() {
  return {
    name: 'Manasu Pilupu',
    short_name: 'Manasu Pilupu',
    description: 'Words from the Heart - A Telugu Blog',
    start_url: '/',
    display: 'standalone',
    background_color: 'transparent',
    theme_color: 'transparent',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
    ],
  }
}
