import {
  Home,
  Bell,
  Users,
  Folder,
  Clock,
  Star,
  Trash2,
  Cloud,
  Plus,
} from 'lucide-react';

export const sidebarMock = [
  {
    title: 'Main',
    items: [
      // {
      //   icon: Home,
      // href: "/home",
      //   title: 'Home',
      // },
      // {
      //   icon: Bell,
      //   href: "/#",
      //   title: 'Activity',
      // },
      // {
      //   icon: Users,
      //   href: "/#",
      //   title: 'Workspaces',
      // },
      {
        icon: Folder,
        href: "/my-drive",
        title: 'My Drive',
      },
      {
        icon: Users,
        href: "/shared-with-me",
        title: 'Shared with me',
      },
      // {
      //   icon: Clock,
      //   href: "/#",
      //   title: 'Recent',
      // },
      {
        icon: Star,
        href: "/starred",
        title: 'Starred',
      },
      {
        icon: Trash2,
        href: "/trash",
        title: 'Trash',
      },
      // {
      //   icon: Cloud,
      //   href: "/#",
      //   title: 'Storage',
      // },
    ],
  },
];
