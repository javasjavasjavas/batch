import { useI18n } from '../../i18n/LocaleContext';
import { SearchIcon, XIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface SearchInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  className?: string;
}

export function SearchInput({ id, value, onChange, placeholder, label, className }: SearchInputProps) {
  const { tr } = useI18n();
  return (
    <div className={twMerge('relative', className)}>
      <label htmlFor={id} className="sr-only">
        {tr(label)}
      </label>
      <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted" aria-hidden="true" />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={tr(placeholder)}
        autoComplete="off"
        className="h-12 w-full rounded-xl border border-line bg-white pl-11 pr-11 text-[15px] text-ink placeholder:text-[#8E9389] shadow-soft transition-[border-color,box-shadow] duration-150 ease-out hover:border-line-strong focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-lime/70 [&::-webkit-search-cancel-button]:hidden" />
      
      {value &&
      <button
        type="button"
        onClick={() => onChange('')}
        aria-label={tr("Clear search")}
        className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted transition-colors duration-150 hover:bg-sunken hover:text-ink">
        
          <XIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      }
    </div>);

}