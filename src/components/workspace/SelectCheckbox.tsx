import { useI18n } from '../../i18n/LocaleContext';
import { CheckIcon, MinusIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface SelectCheckboxProps {
  checked: boolean | 'mixed';
  onChange: () => void;
  label: string;
  className?: string;
}

export function SelectCheckbox({ checked, onChange, label, className }: SelectCheckboxProps) {
  const { tr } = useI18n();
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={tr(label)}
      onClick={onChange}
      className={twMerge(
        "relative flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border transition-[background-color,border-color] duration-150 ease-out before:absolute before:-inset-2.5 before:content-['']",
        checked ? 'border-[#A9C82B] bg-lime text-ink' : 'border-line-strong bg-white hover:border-[#9EA397]',
        className
      )}>
      
      {checked === true && <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />}
      {checked === 'mixed' && <MinusIcon className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />}
    </button>);

}