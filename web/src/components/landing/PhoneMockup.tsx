import Image from "next/image";

interface PhoneMockupProps {
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
  sizeClass?: string;
}

export function PhoneMockup({
  imageSrc = "/assets/signal_screen.png",
  imageAlt = "Kiaros AI Signal Telegram Broadcast",
  className = "",
  sizeClass = "w-[280px] sm:w-[310px] md:w-[325px] xl:w-[340px]",
}: PhoneMockupProps) {
  return (
    <div className={`relative mx-auto flex items-center justify-center ${className}`}>
      {/* Ambient background glow behind the phone */}
      <div
        className="pointer-events-none absolute -inset-6 rounded-full bg-gradient-to-tr from-zinc-300/40 via-zinc-200/50 to-zinc-400/20 blur-3xl opacity-70"
        aria-hidden="true"
      />

      {/* The Phone Chassis Container */}
      <div className={`relative ${sizeClass} transition-transform duration-500 ease-out hover:-translate-y-1.5`}>
        {/* Hardware Frame with Titanium Dark Bezel */}
        <div className="relative rounded-[30px] sm:rounded-[40px] xl:rounded-[46px] p-[5px] sm:p-[7px] xl:p-[9px] bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.1),0_0_40px_rgba(0,0,0,0.06)] ring-1 ring-zinc-800/80">
          
          {/* Side Hardware Buttons */}
          <div className="hidden sm:block absolute -left-[3px] top-[74px] h-6 w-[3px] rounded-l-sm bg-zinc-700/90" />
          <div className="hidden sm:block absolute -left-[3px] top-[110px] h-11 w-[3px] rounded-l-sm bg-zinc-700/90" />
          <div className="hidden sm:block absolute -left-[3px] top-[162px] h-11 w-[3px] rounded-l-sm bg-zinc-700/90" />
          <div className="hidden sm:block absolute -right-[3px] top-[120px] h-14 w-[3px] rounded-r-sm bg-zinc-700/90" />

          {/* Inner Phone Screen */}
          <div className="relative overflow-hidden rounded-[25px] sm:rounded-[33px] xl:rounded-[38px] bg-black ring-1 ring-black/80">
            {/* The Actual Signal Screen Image */}
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={1181}
              height={2560}
              priority
              className="w-full h-auto block select-none pointer-events-none"
              sizes="(max-width: 640px) 160px, (max-width: 1024px) 260px, 340px"
            />

            {/* Specular Glare / Glass Sheen Effect */}
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.12] rounded-[25px] sm:rounded-[33px] xl:rounded-[38px]"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DualPhoneMockup({
  leftImageSrc = "/assets/signal_screen.png",
  rightImageSrc = "/assets/signal_screen_2.png",
  className = "",
}: {
  leftImageSrc?: string;
  rightImageSrc?: string;
  className?: string;
}) {
  return (
    <div className={`relative mx-auto flex items-center justify-center ${className}`}>
      {/* Ambient background glow behind both phones */}
      <div
        className="pointer-events-none absolute -inset-8 rounded-full bg-gradient-to-tr from-zinc-300/40 via-zinc-200/50 to-emerald-300/30 blur-3xl opacity-75"
        aria-hidden="true"
      />

      <div className="relative flex items-center justify-center gap-2 sm:gap-3.5 md:gap-5">
        {/* Left Phone: Signal Setup Entry Alert */}
        <div className="relative z-10 transition-all duration-500 ease-out hover:z-30 hover:-translate-y-2">
          <PhoneMockup
            imageSrc={leftImageSrc}
            imageAlt="Kiaros AI Signal Telegram Broadcast Entry"
            sizeClass="w-[145px] sm:w-[185px] md:w-[215px] lg:w-[205px] xl:w-[240px]"
          />
        </div>

        {/* Right Phone: TP1 & TP2 Hit Target Execution */}
        <div className="relative z-20 translate-y-3 sm:translate-y-4 md:translate-y-5 transition-all duration-500 ease-out hover:z-30 hover:translate-y-0">
          <PhoneMockup
            imageSrc={rightImageSrc}
            imageAlt="Kiaros AI Signal TP1 & TP2 Hit Alert"
            sizeClass="w-[145px] sm:w-[185px] md:w-[215px] lg:w-[205px] xl:w-[240px]"
          />
        </div>
      </div>
    </div>
  );
}
