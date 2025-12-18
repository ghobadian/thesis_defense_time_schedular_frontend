import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { studentAPI } from '../../api/student.api';
import {Student} from "../../types";

export const ProfilePage: React.FC = () => {
    const queryClient = useQueryClient();

    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const [phoneNumber, setPhoneNumber] = useState('');
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState<any>({});
    const [message, setMessage] = useState<string | null>(null);

    const { data: profile } = useQuery<Student>({
        queryKey: ['studentProfile'],
        queryFn: studentAPI.getProfile
    });

    useEffect(() => {
        if (profile) {
            setPhoneNumber(profile.phoneNumber || '');
        }
    }, [profile]);

    const updatePhoneMutation = useMutation({
        mutationFn: (phone: string) => studentAPI.updatePhoneNumber(phone),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
            setIsEditingPhone(false);
            setMessage('Phone number updated successfully');
            setErrors({});
        },
        onError: (error: any) => {
            // Safely extract error message from different possible response structures
            let errorMessage = 'Failed to update phone number';

            if (error?.response?.data) {
                const data = error.response.data;

                if (typeof data === 'string') {
                    // Backend returned a plain string
                    errorMessage = data;
                } else if (typeof data.message === 'string') {
                    // Backend returned { message: "..." }
                    errorMessage = data.message;
                } else if (typeof data.phoneNumber === 'string') {
                    // Backend returned validation error { phoneNumber: "..." }
                    errorMessage = data.phoneNumber;
                } else if (typeof data.error === 'string') {
                    // Backend returned { error: "..." }
                    errorMessage = data.error;
                } else {
                    // Try to get the first error message from any field
                    const firstKey = Object.keys(data)[0];
                    if (firstKey && typeof data[firstKey] === 'string') {
                        errorMessage = data[firstKey];
                    }
                }
            } else if (error?.message) {
                errorMessage = error.message;
            }

            setErrors({ phone: errorMessage });
        }
    });

    const updatePasswordMutation = useMutation({
        mutationFn: studentAPI.changePassword,
        onSuccess: () => {
            setIsChangingPassword(false);
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setMessage('Password changed successfully');
            setErrors({});
        },
        onError: () => {
            setErrors({ password: 'Failed to update password' });
        }
    });

    const submitPhone = (e: any) => {
        e.preventDefault();
        if (!phoneNumber.trim()) {
            setErrors({ phone: 'Phone number is required' });
            return;
        }
        updatePhoneMutation.mutate(phoneNumber);
    };

    const submitPassword = (e: any) => {
        e.preventDefault();
        const { currentPassword, newPassword, confirmPassword } = passwords;

        const newErr: any = {};

        if (!currentPassword) newErr.currentPassword = 'Current password is required';
        if (!newPassword) newErr.newPassword = 'New password is required';
        if (newPassword && newPassword.length < 8) newErr.newPassword = 'Minimum 8 characters';
        if (newPassword !== confirmPassword) newErr.confirmPassword = 'Passwords do not match';

        if (Object.keys(newErr).length > 0) {
            setErrors(newErr);
            return;
        }

        updatePasswordMutation.mutate({ currentPassword, newPassword });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>

            {message && (
                <div className="p-3 bg-green-100 border border-green-300 rounded text-green-800">
                    {message}
                </div>
            )}

            <Card title="Personal Information">
                <div className="space-y-4">
                    <Input label="First Name" value={profile?.firstName || ''} disabled />
                    <Input label="Last Name" value={profile?.lastName || ''} disabled />
                    <Input label="Email" value={profile?.email || ''} disabled />
                    <Input label="Student Number" value={profile?.studentNumber || ''} disabled />
                    <Input label="Department" value={profile?.department?.name || ''} disabled />
                    <Input label="Field" value={profile?.field?.name || ''} disabled />
                    <Input
                        label="Instructor"
                        value={
                            profile
                                ? `${profile.instructor.firstName} ${profile.instructor.lastName}`
                                : ''
                        }
                        disabled
                    />

                    <p className="text-sm text-gray-500">
                        Only your phone number and password can be edited.
                    </p>
                </div>
            </Card>

            <Card title="Phone Number">
                {!isEditingPhone ? (
                    <div className="space-y-4">
                        <Input label="Phone Number" value={phoneNumber} disabled />
                        <Button onClick={() => setIsEditingPhone(true)}>Edit Phone</Button>
                    </div>
                ) : (
                    <form onSubmit={submitPhone} className="space-y-4">
                        <Input
                            label="Phone Number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                        {errors.phone && <p className="text-red-600">{errors.phone}</p>}

                        <div className="flex space-x-2">
                            <Button type="submit" isLoading={updatePhoneMutation.isPending}>
                                Save
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setIsEditingPhone(false);
                                    setErrors({});
                                    setPhoneNumber(profile?.phoneNumber || '');
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                )}
            </Card>

            <Card title="Change Password">
                {!isChangingPassword ? (
                    <Button onClick={() => setIsChangingPassword(true)}>
                        Change Password
                    </Button>
                ) : (
                    <form onSubmit={submitPassword} className="space-y-4">
                        <Input
                            type="password"
                            label="Current Password"
                            value={passwords.currentPassword}
                            onChange={(e) =>
                                setPasswords({ ...passwords, currentPassword: e.target.value })
                            }
                        />
                        {errors.currentPassword && (
                            <p className="text-red-600">{errors.currentPassword}</p>
                        )}

                        <Input
                            type="password"
                            label="New Password"
                            value={passwords.newPassword}
                            onChange={(e) =>
                                setPasswords({ ...passwords, newPassword: e.target.value })
                            }
                        />
                        {errors.newPassword && (
                            <p className="text-red-600">{errors.newPassword}</p>
                        )}

                        <Input
                            type="password"
                            label="Confirm New Password"
                            value={passwords.confirmPassword}
                            onChange={(e) =>
                                setPasswords({ ...passwords, confirmPassword: e.target.value })
                            }
                        />
                        {errors.confirmPassword && (
                            <p className="text-red-600">{errors.confirmPassword}</p>
                        )}

                        {errors.password && (
                            <p className="text-red-600">{errors.password}</p>
                        )}

                        <div className="flex space-x-2">
                            <Button type="submit" isLoading={updatePasswordMutation.isPending}>
                                Update Password
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setIsChangingPassword(false);
                                    setErrors({});
                                    setPasswords({
                                        currentPassword: '',
                                        newPassword: '',
                                        confirmPassword: ''
                                    });
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                )}
            </Card>
        </div>
    );
};
