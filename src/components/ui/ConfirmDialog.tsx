import { useI18n } from '../../i18n/LocaleContext';
import React from 'react';
import { Button } from './Button';
import { Dialog } from './Dialog';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'danger' | 'default';
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  tone = 'default'
}: ConfirmDialogProps) {
  const { tr } = useI18n();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={tr(title)}
      description={tr(description)}
      size="sm"
      role="alertdialog"
      bodyClassName="pb-2"
      footer={
      <>
          <Button variant="secondary" onClick={onClose} data-autofocus>
            {tr(cancelLabel)}
          </Button>
          <Button
          variant={tone === 'danger' ? 'danger' : 'primary'}
          onClick={() => {
            onConfirm();
            onClose();
          }}>
          
            {tr(confirmLabel)}
          </Button>
        </>
      } />);


}