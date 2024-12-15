import SidebarItem from './SidebarItem';

const SidebarGroupItem = ({ items, title }) => {
  return (
    <div key={title} className="space-y-2">
      <p className="select-none text-sm font-medium uppercase text-slate-500/70">
        {title}
      </p>
      <div className="space-y-1">
        {items.map(subItem => (
          <SidebarItem {...subItem} key={subItem.title} />
        ))}
      </div>
    </div>
  );
};

export default SidebarGroupItem;
