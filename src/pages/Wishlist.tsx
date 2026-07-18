export function Wishlist() {
  return (
    <div className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-[#111111] mb-4">
          Your Wishlist
        </h1>
        <p className="text-[#666666] text-[15px] mb-12">You have 0 items in your wishlist.</p>
        
        <div className="py-20 text-center border border-dashed border-[#eaeaea]">
           <p className="text-[#888888] mb-6">Your wishlist is currently empty.</p>
           <a href="/products" className="inline-flex py-3 px-8 bg-[#111111] text-white text-[12px] font-medium uppercase tracking-widest hover:bg-[#333]">Keep Shopping</a>
        </div>
      </div>
    </div>
  );
}
