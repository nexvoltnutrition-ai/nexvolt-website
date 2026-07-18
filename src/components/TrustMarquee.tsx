export function TrustMarquee() {
  const messages = [
    "Free Shipping Above ₹999",
    "100% Authentic Supplements",
    "Lab Tested Performance Products",
    "Secure Payments",
    "Fast Delivery Across India"
  ];

  // duplicate messages to create seamless loop
  const duplicatedMessages = [...messages, ...messages];

  return (
    <div className="bg-[#f47c20] text-white h-[40px] flex items-center overflow-hidden w-full relative">
      <div className="flex whitespace-nowrap animate-marquee w-max">
        {duplicatedMessages.map((msg, idx) => (
          <div key={idx} className="flex items-center">
            <span className="text-[12px] sm:text-[13px] font-medium tracking-widest uppercase px-6 sm:px-10">
              {msg}
            </span>
            <span className="w-1.5 h-1.5 bg-white/30 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
