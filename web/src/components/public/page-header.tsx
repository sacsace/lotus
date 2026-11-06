import { HotelImage } from "@/components/hotel-image";

export function PageBanner({
  index,
  title,
  subtitle,
  image,
  imageAlt,
}: {
  index: string;
  title: string;
  subtitle?: string;
  image: string;
  imageAlt: string;
}) {
  return (
    <section className="relative min-h-[380px] overflow-hidden bg-[#1b1d1f] text-white sm:min-h-[480px]">
      <HotelImage src={image} alt={imageAlt} fill priority variant="banner" sizes="100vw" quality={90} />
      <div className="absolute inset-y-0 left-0 w-[48%] bg-[#1b1d1f] sm:w-[40%]" />
      <div className="relative z-10 flex min-h-[380px] flex-col justify-end px-6 py-10 sm:min-h-[480px] sm:px-10">
        <p className="text-[11px] font-medium tracking-[0.22em] text-white/65">{index}</p>
        <h1 className="mt-2 max-w-3xl text-5xl font-bold leading-[0.88] tracking-[-0.05em] sm:text-7xl">{title}</h1>
        {subtitle ? <p className="mt-5 max-w-md text-sm leading-7 text-white/70">{subtitle}</p> : null}
      </div>
    </section>
  );
}

export function PageHeader({
  label,
  title,
  subtitle,
}: {
  label: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="border-b border-border px-5 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[#8a8176]">{label}</p>
        <span className="mx-auto mt-4 block h-px w-10 bg-[#a68456]" />
        <h1 className="mt-5 font-display text-4xl font-medium sm:text-5xl">{title}</h1>
        {subtitle ? <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted">{subtitle}</p> : null}
      </div>
    </section>
  );
}

export function WixHeading({
  kicker,
  title,
  text,
}: {
  kicker?: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {kicker ? <p className="text-[11px] uppercase tracking-[0.28em] text-[#8a8176]">{kicker}</p> : null}
      <span className="mx-auto mt-4 block h-px w-10 bg-[#a68456]" />
      <h2 className="mt-5 font-display text-4xl font-medium leading-tight sm:text-5xl">{title}</h2>
      {text ? <p className="mt-4 text-sm leading-7 text-[#6d675f]">{text}</p> : null}
    </div>
  );
}
