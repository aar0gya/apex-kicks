import Ticker from '../components/sections/Ticker';
import Hero from '../components/sections/Hero';
import FeaturedDrop from '../components/sections/FeaturedDrop';
import ProductsGrid from '../components/sections/ProductsGrid';
import BrandStory from '../components/sections/BrandStory';
import Testimonials from '../components/sections/Testimonials';
import Newsletter from '../components/sections/Newsletter';

export default function HomePage() {
    const scrollToShop = () => {
        document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <>
            <Ticker />
            <div className="page-enter">
                <Hero onShopClick={scrollToShop} />
                <FeaturedDrop />
                <ProductsGrid />
                <BrandStory />
                <Testimonials />
                <Newsletter />
            </div>
        </>
    );
}