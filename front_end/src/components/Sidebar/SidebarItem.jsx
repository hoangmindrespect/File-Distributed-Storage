
import { motion } from 'framer-motion';
import { ChevronRight, Dot } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

const SidebarItem = ({ href = '#', icon: Icon = Dot, title, items = [] }) => {
  const hasItems = items.length > 0;

  const router = useNavigate();
  const { pathname } = useLocation();

  const isLinkActive = pathname.includes(href);
  const [expanded, setExpanded] = useState(isLinkActive);

  const handleExpand = () => {
    if (!hasItems) return router(href);
    setExpanded(prev => !prev);
  };

  const SubItem = ({ title, href, icon }) => {
    const isSubLinkActive = pathname === href;
    const SubIcon = icon ?? Dot;
    return (
      <Link
        to={href ?? '#'}
        key={title}
        className="group flex w-full items-center justify-between gap-2 rounded px-4 py-2 transition-colors">
        <SubIcon
          size={20}
          className={cn(
            'group-hover:text-primary',
            isSubLinkActive ? 'text-primary' : 'text-slate-700',
          )}
        />
        <h4
          className={cn(
            `flex-1 text-left group-hover:text-primary`,
            isSubLinkActive ? 'font-semibold text-primary' : 'font-normal text-slate-700',
            'text-sm',
          )}>
          {title}
        </h4>
      </Link>
    );
  };

  return (
    <div>
      <button
        onClick={handleExpand}
        className={cn(
          `group flex w-full items-center justify-between gap-2 rounded-full px-4 py-2 hover:bg-gray-200`,
          isLinkActive && 'bg-gray-300 inner-border-small',
          'mb-1',
        )}>
        <Icon
          size={20}
          className={cn(
            'group-hover:text-primary',
            isLinkActive ? 'text-primary' : 'text-slate-700',
          )}
        />
        <h4
          className={cn(
            `flex-1 text-left text-sm group-hover:text-primary `,
            isLinkActive ? 'font-semibold text-primary' : 'font-normal text-slate-700',
          )}>
          {title}
        </h4>
        {hasItems && (
          <motion.div
            animate={{ rotate: expanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            exit={{ opacity: 0 }}>
            <ChevronRight
              size={20}
              className="text-slate-700 group-hover:text-primary"
            />
          </motion.div>
        )}
      </button>
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
          exit={{ opacity: 0, height: 0 }}>
          {items.map((item, index) => (
            <SubItem key={index} {...item} />
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default SidebarItem;
