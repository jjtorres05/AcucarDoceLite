import logoImg from '../assets/acucardoce_logo_png_transparente_para_fondo_azul_600.png'

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
