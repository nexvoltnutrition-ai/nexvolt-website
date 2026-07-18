import { Hero } from "../components/Hero";
import { ShopByCategory } from "../components/ShopByCategory";
import { ShopBySport } from "../components/ShopBySport";
import { BestSellers } from "../components/BestSellers";
import { NewLaunches } from "../components/NewLaunches";
import { TrustValues } from "../components/TrustValues";
import { Reviews } from "../components/Reviews";


export function Home() {
  return (
    <>
      <Hero />
      <ShopByCategory />
      <ShopBySport />
      <BestSellers />
      <NewLaunches />
                  <TrustValues />
                  <Reviews />
    </>
  );
}
