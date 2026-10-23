import { useI18n } from '../../i18n/LocaleContext';
import { Field, describedBy } from '../ui/Field';
import { ColorPicker } from '../ui/ColorPicker';

interface ColorFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
}
export function ColorField({ id, label, value, onChange, hint, error }: ColorFieldProps) {
  const { tr } = useI18n();
  return <Field label={tr(label)} htmlFor={id} hint={hint} error={error}>
    <ColorPicker id={id} label={tr(label)} value={value} onChange={onChange} invalid={!!error} describedBy={describedBy(id, hint, error)} />
  </Field>;
}
