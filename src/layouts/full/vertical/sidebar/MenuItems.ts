import { uniqueId } from 'lodash';

interface MenuitemsType {
  [x: string]: any;
  id?: string;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  icon?: any;
  href?: string;
  children?: MenuitemsType[];
  chip?: string;
  chipColor?: string;
  variant?: string;
  external?: boolean;
}
import {
  IconPoint,
  IconAperture,
  IconRocket,
  IconShield,
  IconParachute,
  IconMotorbike,
  IconBooks,
  IconCreditCard,
  IconBallon,
} from '@tabler/icons';

const Menuitems: MenuitemsType[] = [
 
  {
    id: uniqueId(),
    title: 'Home',
    icon: IconAperture,
    href: '/dashboards/modern',
    chipColor: 'secondary',
  },
  {
    id: uniqueId(),
    title: 'Launchpad',
    icon: IconRocket,
    href: '/auth/maintenance',
    children: [
      {
        id: uniqueId(),
        title: 'Create Launchpad',
        icon: IconPoint,
        href: '/auth/maintenance',
      },
      {
        id: uniqueId(),
        title: 'Create fair launch',
        icon: IconPoint,
        href: '/auth/maintenance',
      },
      {
        id: uniqueId(),
        title: 'Create dutch auction',
        icon: IconPoint,
        href: '/auth/maintenance',
      },
      {
        id: uniqueId(),
        title: 'Create subscription pool',
        icon: IconPoint,
        href: '/auth/maintenance',
      },
      {
        id: uniqueId(),
        title: 'Create Token',
        icon: IconPoint,
        href: '/auth/maintenance',
      },
      {
        id: uniqueId(),
        title: 'Launchpad List',
        icon: IconPoint,
        href: '/auth/maintenance',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Private Sale',
    icon: IconShield,
    href: '/auth/maintenance',
    children: [
      {
        id: uniqueId(),
        title: 'Create Private Sale',
        icon: IconPoint,
        href: '/auth/maintenance',
      },
      {
        id: uniqueId(),
        title: 'Private Sale List',
        icon: IconPoint,
        href: '/auth/maintenance',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Airdrop',
    icon: IconParachute,
    href: '/auth/maintenance',
    children: [
      {
        id: uniqueId(),
        title: 'Create Airdrop',
        icon: IconPoint,
        href: '/auth/maintenance',
      },
      {
        id: uniqueId(),
        title: 'Airdrop List',
        icon: IconPoint,
        href: '/auth/maintenance',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Staking',
    icon: IconBallon,
    href: '/view/staking/createstaking',
    
    
  },
  {
    id: uniqueId(),
    title: 'Farms',
    icon: IconMotorbike,
    href: '/auth/maintenance',
    children: [
      {
        id: uniqueId(),
        title: 'Create Farms',
        icon: IconPoint,
        href: '/auth/maintenance',
      },
      {
        id: uniqueId(),
        title: 'Farms List',
        icon: IconPoint,
        href: '/auth/maintenance',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'KYC & Audit',
    icon: IconCreditCard,
    href: '/auth/maintenance',
    children: [
      {
        id: uniqueId(),
        title: 'KYC',
        icon: IconPoint,
        href: '/auth/maintenance',
      },
      {
        id: uniqueId(),
        title: 'Audit',
        icon: IconPoint,
        href: '/auth/maintenance',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Docs  ',
    icon: IconBooks,
    href: '/auth/maintenance',
  },
  
];

export default Menuitems;
