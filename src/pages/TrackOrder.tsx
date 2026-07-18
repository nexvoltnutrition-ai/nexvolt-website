export function TrackOrder() {
  return (
    <div className="py-24 bg-[#fafafa]">
      <div className="max-w-xl mx-auto px-6 sm:px-8 bg-white p-12 border border-[#eaeaea] shadow-sm">
        <h1 className="text-2xl md:text-3xl font-medium tracking-tight text-[#111111] mb-4 text-center">
          Track Your Order
        </h1>
        <p className="text-[#666666] text-[14px] text-center mb-8">
          Enter your order number and email address below to track your delivery status.
        </p>

        <form className="space-y-6">
           <div>
             <label className="block text-[12px] font-medium uppercase tracking-widest text-[#111111] mb-2">Order Number</label>
             <input type="text" className="w-full border border-[#eaeaea] px-4 py-3 text-[14px] focus:outline-none focus:border-[#111111] transition-colors" placeholder="e.g. NX-12345" />
           </div>
           <div>
             <label className="block text-[12px] font-medium uppercase tracking-widest text-[#111111] mb-2">Email Address</label>
             <input type="email" className="w-full border border-[#eaeaea] px-4 py-3 text-[14px] focus:outline-none focus:border-[#111111] transition-colors" placeholder="your@email.com" />
           </div>
           
           <button className="w-full bg-[#111111] text-white py-4 text-[13px] font-medium uppercase tracking-widest hover:bg-[#333333] transition-colors mt-4">
             Track Order
           </button>
        </form>
      </div>
    </div>
  );
}
