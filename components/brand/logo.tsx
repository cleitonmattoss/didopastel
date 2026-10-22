import Image from 'next/image'

export function Logo({ className, tone = 'light' }: { className?: string; tone?: 'light' | 'dark' }) {
  return (
    <Image
      src="/LOGO.png"
      alt="Di do Pastel"
      width={1675}
      height={1024}
      className={className ?? 'block h-auto w-[112px] shrink-0'}
      style={tone === 'dark' ? { filter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.7))' } : undefined}
      priority
    />
  )
}
