export default function BrandLogo({ className = "text-2xl", alt = "DesireChat" }) {
  return (
    <span className={`brand-logo inline-flex items-center ${className}`} aria-label={alt}>
      <img
        src="/logo/logo.png"
        alt={alt}
        className="brand-logo__img h-[1.15em] w-auto max-w-none object-contain select-none"
        draggable={false}
      />
    </span>
  );
}
