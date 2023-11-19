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
    href: '',
    children: [
      {
        id: uniqueId(),
        title: 'Create Launchpad',
        icon: IconPoint,
        href: '',
      },
      {
        id: uniqueId(),
        title: 'Create fair launch',
        icon: IconPoint,
        href: '',
      },
      {
        id: uniqueId(),
        title: 'Create dutch auction',
        icon: IconPoint,
        href: '',
      },
      {
        id: uniqueId(),
        title: 'Create subscription pool',
        icon: IconPoint,
        href: '',
      },
      {
        id: uniqueId(),
        title: 'Create Token',
        icon: IconPoint,
        href: '',
      },
      {
        id: uniqueId(),
        title: 'Launchpad List',
        icon: IconPoint,
        href: '',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Private Sale',
    icon: IconShield,
    href: '',
    children: [
      {
        id: uniqueId(),
        title: 'Create Private Sale',
        icon: IconPoint,
        href: '',
      },
      {
        id: uniqueId(),
        title: 'Private Sale List',
        icon: IconPoint,
        href: '',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Airdrop',
    icon: IconParachute,
    href: '',
    children: [
      {
        id: uniqueId(),
        title: 'Create Airdrop',
        icon: IconPoint,
        href: '',
      },
      {
        id: uniqueId(),
        title: 'Airdrop List',
        icon: IconPoint,
        href: '',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Staking',
    icon: IconBallon,
    href: '',
    children: [
      {
        id: uniqueId(),
        title: 'Create Staking',
        icon: IconPoint,
        href: '/view/staking/createstaking',
      },
      {
        id: uniqueId(),
        title: 'Staking List',
        icon: IconPoint,
        href: '',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Farms',
    icon: IconMotorbike,
    href: '',
    children: [
      {
        id: uniqueId(),
        title: 'Create Farms',
        icon: IconPoint,
        href: '/apps/blog/posts',
      },
      {
        id: uniqueId(),
        title: 'Farms List',
        icon: IconPoint,
        href: '',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'KYC & Audit',
    icon: IconCreditCard,
    href: '',
    children: [
      {
        id: uniqueId(),
        title: 'KYC',
        icon: IconPoint,
        href: '',
      },
      {
        id: uniqueId(),
        title: 'Audit',
        icon: IconPoint,
        href: '',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Docs  ',
    icon: IconBooks,
    href: '',
  },
  
];

export default Menuitems;
