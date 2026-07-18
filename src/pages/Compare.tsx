export function Compare() {
  return (
    <div className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-[#111111] mb-4 text-center">
          Compare Products
        </h1>
        <p className="text-[#666666] max-w-2xl text-[15px] text-center mx-auto mb-16">
          Find the perfect formulation for your specific athletic goals.
        </p>

        <div className="overflow-x-auto">
           <table className="w-full min-w-[800px] border-collapse text-left text-[14px]">
             <thead>
               <tr className="border-b border-[#111111]">
                 <th className="py-4 px-6 font-medium text-[#111111] w-1/4">Feature</th>
                 <th className="py-4 px-6 font-medium text-[#111111]">Whey Isolate</th>
                 <th className="py-4 px-6 font-medium text-[#111111]">Pre-Workout Engine</th>
                 <th className="py-4 px-6 font-medium text-[#111111]">Recovery BCAA</th>
               </tr>
             </thead>
             <tbody>
               <tr className="border-b border-[#eaeaea]">
                 <td className="py-5 px-6 text-[#666666]">Primary Goal</td>
                 <td className="py-5 px-6 font-medium">Muscle Growth</td>
                 <td className="py-5 px-6 font-medium">Energy & Focus</td>
                 <td className="py-5 px-6 font-medium">Recovery & Hydration</td>
               </tr>
               <tr className="border-b border-[#eaeaea]">
                 <td className="py-5 px-6 text-[#666666]">Key Ingredients</td>
                 <td className="py-5 px-6">25g Protein, 5.5g BCAAs</td>
                 <td className="py-5 px-6">200mg Caffeine, Beta-Alanine</td>
                 <td className="py-5 px-6">7g BCAAs, Electrolytes</td>
               </tr>
               <tr className="border-b border-[#eaeaea]">
                 <td className="py-5 px-6 text-[#666666]">Best Time to Take</td>
                 <td className="py-5 px-6">Post-Workout</td>
                 <td className="py-5 px-6">Pre-Workout</td>
                 <td className="py-5 px-6">Intra-Workout</td>
               </tr>
               <tr>
                 <td className="py-5 px-6 text-[#666666]">Price</td>
                 <td className="py-5 px-6">₹3,599</td>
                 <td className="py-5 px-6">₹2,999</td>
                 <td className="py-5 px-6">₹2,799</td>
               </tr>
             </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}
