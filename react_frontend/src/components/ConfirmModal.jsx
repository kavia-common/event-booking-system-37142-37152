import React from 'react';

// PUBLIC_INTERFACE
export default function ConfirmModal({ open, title = 'Confirm', message, onConfirm, onCancel, confirmLabel = 'Confirm', cancelLabel = 'Cancel', busy = false }) {
  /** A simple confirmation modal for user actions. */
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="modal">
        <div className="modal-header">
          <h3 id="confirm-title" style={{ margin: 0 }}>{title}</h3>
          <button className="button secondary" onClick={onCancel} disabled={busy} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">
          <p style={{ marginTop: 0 }}>{message}</p>
        </div>
        <div className="modal-actions">
          <button className="button secondary" onClick={onCancel} disabled={busy}>{cancelLabel}</button>
          <button className="button accent" onClick={onConfirm} disabled={busy}>{busy ? 'Processing...' : confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
