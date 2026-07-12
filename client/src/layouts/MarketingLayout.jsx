import Navbar from '../components/Navbar';
import { useLenis } from '../hooks/useLenis';

const MarketingLayout = ({ children }) => {
  useLenis();

  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
};

export default MarketingLayout;
