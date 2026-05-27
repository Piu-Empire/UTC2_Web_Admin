// src/components/common/StatCard.jsx (tạo mới)
import { motion } from 'framer-motion';
import { SkeletonBar } from './Skeleton';

/**
 * @param {{
 *   icon:       React.ReactNode,
 *   iconBg?:    string,   // Tailwind bg class, default bg-brand-50
 *   iconColor?: string,   // Tailwind text class, default text-brand-600
 *   value:      string|number,
 *   label:      string,
 *   loading?:   boolean,
 *   index?:     number,   // stagger delay index
 * }} props
 */
export default function StatCard({
  icon,
  iconBg    = 'bg-brand-50',
  iconColor = 'text-brand-600',
  value,
  label,
  loading = false,
  index   = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07, ease: 'easeOut' }}
      className="card card-hover p-5"
    >
      {/* Icon circle */}
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
        <span className={iconColor}>{icon}</span>
      </div>

      {/* Value */}
      <div className="mt-3">
        {loading ? (
          <SkeletonBar className="h-8 w-24" />
        ) : (
          <p className="font-display font-bold text-3xl text-ink leading-none">
            {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
          </p>
        )}
      </div>

      {/* Label */}
      <div className="text-sm text-ink-muted mt-1">
        {loading ? <SkeletonBar className="h-3 w-32 mt-1" /> : label}
      </div>
    </motion.div>
  );
}