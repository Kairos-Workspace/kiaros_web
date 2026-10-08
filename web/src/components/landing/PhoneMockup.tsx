import Image from "next/image";

interface PhoneMockupProps {
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
}

export function PhoneMockup({
  imageSrc = "/assets/signal_screen.png",
  imageAlt = "Kiaros AI Signal Telegram Broadcast",
  className = "",
}: PhoneMockupProps) {
  return (
    <div className={`relative mx-auto flex items-center justify-center ${className}`}>
      {/* Ambient background glow behind the phone */}
      <div
        className="pointer-events-none absolute -inset-6 rounded-full bg-gradient-to-tr from-zinc-300/40 via-zinc-200/50 to-zinc-400/20 blur-3xl opacity-70"
        aria-hidden="true"
      />


      {/* The Phone Chassis Container */}
      <div className="relative w-[280px] sm:w-[310px] md:w-[325px] xl:w-[340px] transition-transform duration-500 ease-out hover:-translate-y-1.5">
        {/* Hardware Frame with Titanium Dark Bezel */}
        <div className="relative rounded-[44px] sm:rounded-[48px] p-[8px] sm:p-[10px] bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.1),0_0_40px_rgba(0,0,0,0.06)] ring-1 ring-zinc-800/80">
          
          {/* Side Hardware Buttons */}
          {/* Left: Action Button */}
          <div className="absolute -left-[3px] top-[74px] h-6 w-[3px] rounded-l-sm bg-zinc-700/90" />
          {/* Left: Volume Up */}
          <div className="absolute -left-[3px] top-[110px] h-11 w-[3px] rounded-l-sm bg-zinc-700/90" />
          {/* Left: Volume Down */}
          <div className="absolute -left-[3px] top-[162px] h-11 w-[3px] rounded-l-sm bg-zinc-700/90" />
          {/* Right: Power / Lock */}
          <div className="absolute -right-[3px] top-[120px] h-14 w-[3px] rounded-r-sm bg-zinc-700/90" />

          {/* Inner Phone Screen */}
          <div className="relative overflow-hidden rounded-[36px] sm:rounded-[40px] bg-black ring-1 ring-black/80">
            {/* The Actual Signal Screen Image */}
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={1181}
              height={2560}
              priority
              className="w-full h-auto block select-none pointer-events-none"
              sizes="(max-width: 640px) 280px, (max-width: 1024px) 310px, 340px"
            />

            {/* Specular Glare / Glass Sheen Effect */}
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.12] rounded-[36px] sm:rounded-[40px]"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
