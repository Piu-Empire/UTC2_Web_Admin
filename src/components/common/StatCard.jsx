import { motion } from 'framer-motion';
import { SkeletonBar } from './Skeleton';

export default function StatCard({
  icon,
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
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{
          background: 'var(--avatar-bg)',
          border: '1px solid var(--avatar-border)',
        }}
      >
        <span style={{ color: 'var(--gold-primary)' }}>{icon}</span>
      </div>

      <div className="mt-3">
        {loading ? (
          <SkeletonBar className="h-8 w-24" />
        ) : (
          <p
            className="font-display font-bold text-3xl leading-none stat-value"
            style={{ color: 'var(--text-primary)' }}
          >
            {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
          </p>
        )}
      </div>

      <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
        {loading ? <SkeletonBar className="h-3 w-32 mt-1" /> : label}
      </div>
    </motion.div>
  );
}