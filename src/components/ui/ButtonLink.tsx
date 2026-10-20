import { Link, LinkProps } from 'react-router-dom';
import { buttonClasses, ButtonSize, ButtonVariant } from './Button';

interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function ButtonLink({ variant = 'secondary', size = 'md', className, ...rest }: ButtonLinkProps) {
  return <Link className={buttonClasses(variant, size, className as string | undefined)} {...rest} />;
}