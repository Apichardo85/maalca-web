export interface NavigationItem {
  label: string;
  href: string;
  isExternal?: boolean;
  icon?: string;
  badge?: string;
  subItems?: NavigationItem[];
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

export interface HeaderProps {
  className?: string;
  variant?: "default" | "transparent" | "solid";
  showLogo?: boolean;
  showActions?: boolean;
}

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigationItems: NavigationItem[];
}