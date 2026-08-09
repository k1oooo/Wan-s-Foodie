import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type ButtonVariant = "primary" | "outline";
type ButtonSize = "md" | "sm";

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}

type LinkButtonProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children"> & {
    href: string;
  };

type NativeButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

export type ButtonProps = LinkButtonProps | NativeButtonProps;

// Default state is a solid fill; hover inverts to a cream fill with a
// terracotta border + text, matching the site's pill-button interaction.
const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    "border-[#C1442D] bg-[#C1442D] text-[#FBF7F2] hover:bg-[#FBF7F2] hover:text-[#C1442D]",
  outline:
    "border-[#C1442D] bg-transparent text-[#C1442D] hover:bg-[#C1442D] hover:text-[#FBF7F2]",
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  md: "px-8 py-4 text-lg",
  sm: "px-4 py-2 text-sm",
};

const DISABLED_STYLES =
  "cursor-not-allowed border-[#1F1A17]/20 bg-[#1F1A17]/20 text-[#1F1A17]/50 hover:bg-[#1F1A17]/20 hover:text-[#1F1A17]/50";

/**
 * Reusable pill CTA button. Renders a Next.js <Link> when given an `href`,
 * otherwise a native <button>. `disabled` (native buttons only) overrides
 * the variant with a muted, non-interactive style.
 *
 *   <Button href="/order">Order Now</Button>
 *   <Button variant="outline" href="/#menu">View Menu</Button>
 *   <Button size="sm" onClick={...}>Add More Items</Button>
 *   <Button disabled={!isValid} onClick={handleSend}>Send Order</Button>
 */
export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const isDisabled = "disabled" in rest && !!rest.disabled;

  const classes = [
    "inline-flex items-center justify-center gap-2 rounded-full border-2 font-nunito font-extrabold transition-colors duration-200",
    SIZE_STYLES[size],
    isDisabled ? DISABLED_STYLES : VARIANT_STYLES[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if ("href" in rest && rest.href) {
    const { href, ...linkRest } = rest as LinkButtonProps;
    return (
      <Link href={href} className={classes} {...linkRest}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonRest } = rest as NativeButtonProps;
  return (
    <button type={type} className={classes} {...buttonRest}>
      {children}
    </button>
  );
}
