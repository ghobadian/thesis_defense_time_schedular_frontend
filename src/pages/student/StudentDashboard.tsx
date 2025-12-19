import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { StudentHome } from './StudentHome';
import { ThesisFormPage } from './ThesisFormPage';
import { MeetingsPage } from './MeetingsPage';
import { ProfilePage } from './ProfilePage';
import {ThesisFormCreate} from "../../components/student/ThesisFormCreate";

export const StudentDashboard: React.FC = () => {
    return (
        <Layout>
            <Routes>
                <Route path="dashboard" element={<StudentHome />} />
                <Route path="thesis-form" element={<ThesisFormPage />} />
                <Route path="meetings" element={<MeetingsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="thesis/create" element={<ThesisFormCreate />} />
                <Route path="thesis" element={<ThesisFormPage />} />
                <Route path="*" element={<StudentHome />} />
            </Routes>
        </Layout>
    );
};
