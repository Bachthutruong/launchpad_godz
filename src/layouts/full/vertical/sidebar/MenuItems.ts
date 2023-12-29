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
    title: 'Mint',
    icon: IconMotorbike,
    href: '/view/mint/mint',
  },
];

export default Menuitems;
