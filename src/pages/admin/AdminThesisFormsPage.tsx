// src/pages/admin/AdminThesisFormsPage.tsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../api/admin.api';
import { ThesisForm, FormState } from '../../types';
import { useAuthStore } from '../../store/authStore';
import './AdminThesisFormsPage.css';
import {ActionButton} from "../../components/thesis/ThesisFormDetails";
import {ThesisFormsLayout} from "../../components/thesis/ThesisFormLayout";

const AdminThesisFormsPage: React.FC = () => {
    const { role } = useAuthStore();
    const queryClient = useQueryClient();
    const [selectedForm, setSelectedForm] = useState<ThesisForm | null>(null);

    const { data: forms = [], isLoading, error } = useQuery({
        queryKey: ['admin-forms'],
        queryFn: adminAPI.getForms,
        enabled: role === 'ADMIN',
    });

    const approveMutation = useMutation({
        mutationFn: (formId: number) => adminAPI.approveForm(formId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-forms'] });
            setSelectedForm(null);
        },
    });

    const rejectMutation = useMutation({
        mutationFn: (formId: number) => adminAPI.rejectForm(formId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-forms'] });
            setSelectedForm(null);
        },
    });

    const actionLoading =
        approveMutation.isPending || rejectMutation.isPending;

    const getActionsForForm = (form: ThesisForm): ActionButton[] => {
        // 🔒 HARD GUARD — safety against improper reuse
        if (role !== 'ADMIN') return [];

        if (form.state !== FormState.INSTRUCTOR_APPROVED) return [];

        return [
            {
                label: 'Approve Form',
                loadingLabel: 'Approving...',
                className: 'btn-approve',
                onClick: () => approveMutation.mutate(form.id),
            },
            {
                label: 'Reject Form',
                loadingLabel: 'Rejecting...',
                className: 'btn-reject',
                onClick: () => rejectMutation.mutate(form.id),
            },
        ];
    };

    return (
        <ThesisFormsLayout
            title="Thesis Forms - Admin Review"
            forms={forms}
            isLoading={isLoading}
            error={error as Error}
            selectedForm={selectedForm}
            onSelectForm={setSelectedForm}
            emptyMessage="No thesis forms pending admin review"
            getActionsForForm={getActionsForForm}
            actionLoading={actionLoading}
        />
    );
};

export default AdminThesisFormsPage;
