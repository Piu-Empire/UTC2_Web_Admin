import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';

// Page transition variants (per UI spec)
const pageVariants = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -12 },
};

const pageTransition = { duration: 0.2, ease: 'easeOut' };

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-surface-muted dark:bg-slate-950">
      {/* Fixed sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />

        {/* Scrollable content with page transition */}
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="flex-1 overflow-y-auto p-6"
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}
