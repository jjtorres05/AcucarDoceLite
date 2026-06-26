import logoImg from '../assets/ChatGPT Image 26 jun 2026, 11_09_27 a.m.png'

export default function Logo({ className = '', size = 'md' }) {
  const heights = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
  }

  return (
    <img
      src={logoImg}
      alt="AcucarDoce"
      className={`${heights[size]} w-auto object-contain ${className}`}
    />
  )
}
