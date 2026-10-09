/* Products World logo. Transparent PNGs; a light-ink version is swapped in automatically in night mode. */
export default function Logo({ variant = 'horizontal', className = '' }) {
  const base = variant === 'full' ? '/logo' : '/logo-horizontal';
  return (
    <span className={`logo logo-${variant} ${className}`}>
      <img className="logo-day" src={`${base}.png`} alt="Products World" />
      <img className="logo-night" src={`${base}-dark.png`} alt="" aria-hidden="true" />
    </span>
  );
}
