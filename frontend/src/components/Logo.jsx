import logoImg from '../assets/26 junio.png'

export default function Logo({ className = '', size = 'md' }) {
  const heights = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-30',
  }

  return (
    <img
      src={logoImg}
      alt="AcucarDoce"
      className={`${heights[size]} w-auto object-contain ${className}`}
    />
  )
}
