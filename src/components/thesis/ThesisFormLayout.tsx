// src/components/thesis/ThesisFormsLayout.tsx

import React from 'react';
import { ThesisForm } from '../../types';
import { ThesisFormCard } from './ThesisFormCard';
import { ThesisFormDetails, ActionButton } from './ThesisFormDetails';

interface Props {
    title: string;
    forms: ThesisForm[];
    isLoading: boolean;
    error: Error | null;
    selectedForm: ThesisForm | null;
    onSelectForm: (form: ThesisForm | null) => void;
    emptyMessage: string;
    getActionsForForm: (form: ThesisForm) => ActionButton[];
    actionLoading: boolean;
    onRetry?: () => void;
    children?: React.ReactNode; // For modals
}

export const ThesisFormsLayout: React.FC<Props> = ({
                                                       title,
                                                       forms,
                                                       isLoading,
                                                       error,
                                                       selectedForm,
                                                       onSelectForm,
                                                       emptyMessage,
                                                       getActionsForForm,
                                                       actionLoading,
                                                       onRetry,
                                                       children
                                                   }) => {
    if (isLoading) {
        return (
            <div className="thesis-forms-container">
                <div className="loading-spinner">Loading thesis forms...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="thesis-forms-container">
                <div className="error-message">
                    {error.message || 'Failed to fetch forms'}
                </div>
                {onRetry && (
                    <button onClick={onRetry} className="btn-retry">
                        Retry
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="thesis-forms-container">
            <div className="page-header">
                <h1>{title}</h1>
                <div className="stats">
                    <span className="stat-badge">
                        {forms.length} form{forms.length !== 1 ? 's' : ''} pending review
                    </span>
                </div>
            </div>

            {forms.length === 0 ? (
                <div className="empty-state">
                    <p>{emptyMessage}</p>
                </div>
            ) : (
                <div className="forms-layout">
                    <div className="forms-list">
                        {forms.map((form) => (
                            <ThesisFormCard
                                key={form.id}
                                form={form}
                                selected={selectedForm?.id === form.id}
                                onSelect={() => onSelectForm(form)}
                            />
                        ))}
                    </div>

                    {selectedForm && (
                        <ThesisFormDetails
                            form={selectedForm}
                            onClose={() => onSelectForm(null)}
                            actions={getActionsForForm(selectedForm)}
                            actionLoading={actionLoading}
                        />
                    )}
                </div>
            )}

            {/* Slot for modals */}
            {children}
        </div>
    );
};
