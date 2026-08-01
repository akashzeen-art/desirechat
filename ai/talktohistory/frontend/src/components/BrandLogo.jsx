export default function BrandLogo({ className = "h-9 w-auto", alt = "Flirt Net" }) {
  return (
    <img
      src="/flirt.png"
      alt={alt}
      className={`object-contain select-none ${className}`}
      draggable={false}
    />
  );
}
