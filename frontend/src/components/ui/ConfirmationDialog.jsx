import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  isDestructive = true,
  isLoading = false,
  impactDetails = null,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={isDestructive ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3.5">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isDestructive
              ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
          }`}
        >
          {isDestructive ? (
            <Trash2 className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
        </div>

        <div className="space-y-2 flex-1">
          <p className="text-sm text-[#596258] dark:text-[#B0B7C2] leading-relaxed">
            {message}
          </p>

          {impactDetails && (
            <div className="p-3 rounded-lg bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945] text-xs text-[#596258] dark:text-[#B0B7C2] font-mono space-y-1">
              {Array.isArray(impactDetails) ? (
                impactDetails.map((item, i) => <div key={i}>• {item}</div>)
              ) : (
                <div>{impactDetails}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
