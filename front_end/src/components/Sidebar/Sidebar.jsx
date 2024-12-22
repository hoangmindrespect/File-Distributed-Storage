
import { Image } from '@nextui-org/react';
import { motion } from 'framer-motion';
// import { useTheme } from 'next-themes';
import { Link } from 'react-router-dom';
import SidebarGroupItem from './SidebarGroupItem';
import { sidebarMock } from './Sidebar.mock';
import { cn } from '../../lib/utils';
import NewButton from '../NewButton';

const Sidebar = ({ currentFolderId }) => {
//   const { theme } = useTheme();
  return (
    <div
      className={cn(
        "flex h-screen max-h-screen flex-col bg-background transition-transform md:relative md:z-auto md:transform-none border-r-2"
      )}
    >
      <motion.div
        className={cn(
          `flex h-screen max-h-screen flex-col gap-4 ov border-r-1 scrollbar-thin`,
          "w-[20rem] p-6"
        )}
        animate={{ width: "18rem" }}
        initial={{ width: "18rem" }}
        transition={{ duration: 0.2 }}
        exit={{ width: "18rem" }}
      >
        {/* Add NewButton at the top */}
        <div className="mb-4">
          <NewButton currentFolderId={currentFolderId}/>
        </div>

        <div className={cn("flex flex-col", "gap-6")}>
          {sidebarMock.map((item) => (
            <SidebarGroupItem {...item} key={item.title} />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Sidebar;
