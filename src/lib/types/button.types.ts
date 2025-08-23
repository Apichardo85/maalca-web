export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

export type ButtonSize = "sm" | "md" | "lg";

export interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export interface ButtonConfig {
  variants: Record<ButtonVariant, string>;
  sizes: Record<ButtonSize, string>;
}