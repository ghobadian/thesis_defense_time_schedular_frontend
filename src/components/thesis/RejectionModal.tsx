// src/components/thesis/RejectionModal.tsx

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    isLoading: boolean;
    formTitle: string;
}

export const RejectionModal: React.FC<Props> = ({
    isOpen,
    onClose,
    onConfirm,
    isLoading,
    formTitle
}) => {
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (reason.trim()) {
            onConfirm(reason.trim());
            setReason('');
        }
    };

    const handleClose = () => {
        setReason('');
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Reject Thesis Form</h2>
                    <button onClick={handleClose} className="btn-icon" disabled={isLoading}>
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <p className="modal-subtitle">
                    You are about to reject: <strong>{formTitle}</strong>
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="rejection-reason">
                            Rejection Reason <span className="required">*</span>
                        </label>
                        <textarea
                            id="rejection-reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="form-textarea"
                            rows={4}
                            placeholder="Please provide a reason for rejection..."
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-reject"
                            disabled={!reason.trim() || isLoading}
                        >
                            {isLoading ? 'Rejecting...' : 'Reject Form'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
