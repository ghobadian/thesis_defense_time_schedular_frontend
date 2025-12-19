import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentAPI } from '../../api/student.api';
import { Card } from '../../components/common/Card';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle
} from 'lucide-react';
import { FormState, ThesisForm } from '../../types';

export const MyThesisForms: React.FC = () => {
  const { data: thesisForms, isLoading } = useQuery({
    queryKey: ['myThesisForms'],
    queryFn: studentAPI.getMyThesisForms,
  });

  // Track which card's timeline is expanded
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const getStateIcon = (state: FormState) => {
    switch (state) {
      case FormState.SUBMITTED:
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case FormState.INSTRUCTOR_APPROVED:
      case FormState.ADMIN_APPROVED:
      case FormState.MANAGER_APPROVED:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStateLabel = (state: FormState) => {
    return state.replace(/_/g, ' ');
  };

  // Check if form is in a rejected state
  const isRejected = (state: FormState) => {
    return [
      FormState.INSTRUCTOR_REJECTED,
      FormState.ADMIN_REJECTED,
      FormState.MANAGER_REJECTED,
    ].includes(state);
  };

  // Format date for timeline
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString();
  };

  // Toggle timeline expansion
  const toggleTimeline = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
    );
  }

  if (!thesisForms || thesisForms.length === 0) {
    return (
        <Card>
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              You haven't submitted any thesis forms yet.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Click the "Create New Form" button above to get started.
            </p>
          </div>
        </Card>
    );
  }

  return (
      <div className="space-y-4">
        {thesisForms.map((form: ThesisForm) => {
          const isExpanded = expandedId === form.id;
          const rejected = isRejected(form.state);

          return (
              <Card key={form.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {form.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {form.abstractText}
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Field:</span>
                        <span className="ml-2 font-medium">{form.fieldName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Instructor:</span>
                        <span className="ml-2 font-medium">
                                            {form.instructorFirstName} {form.instructorLastName}
                                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Submitted:</span>
                        <span className="ml-2 font-medium">
                                            {new Date(form.createdAt).toLocaleDateString()}
                                        </span>
                      </div>
                    </div>

                    {/* ✅ REJECTION REASON DISPLAY */}
                    {rejected && form.rejectionReason && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-red-700">
                                Rejection Reason
                              </p>
                              <p className="text-sm text-red-600 mt-1">
                                {form.rejectionReason}
                              </p>
                            </div>
                          </div>
                        </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {getStateIcon(form.state)}
                    <span className="text-sm font-medium capitalize">
                                    {getStateLabel(form.state)}
                                </span>
                  </div>
                </div>

                {/* ✅ TIMELINE TOGGLE BUTTON */}
                <button
                    onClick={() => toggleTimeline(form.id)}
                    className="mt-4 flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  {isExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-1" />
                        Hide Timeline
                      </>
                  ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" />
                        View Timeline
                      </>
                  )}
                </button>

                {/* ✅ TIMELINE SECTION */}
                {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-4">
                        Review Progress
                      </h4>
                      <div className="relative">
                        {/* Vertical line */}
                        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200" />

                        <div className="space-y-6">
                          {/* Step 1: Submitted */}
                          <TimelineStep
                              label="Submitted"
                              date={form.createdAt}
                              isCompleted={true}
                              isRejected={false}
                          />

                          {/* Step 2: Instructor Review */}
                          <TimelineStep
                              label="Instructor Review"
                              date={form.instructorReviewedAt}
                              isCompleted={form.state === FormState.INSTRUCTOR_APPROVED || form.state === FormState.ADMIN_APPROVED || form.state === FormState.MANAGER_APPROVED}
                              isRejected={form.state === FormState.INSTRUCTOR_REJECTED}
                              rejectionReason={
                                form.state === FormState.INSTRUCTOR_REJECTED
                                    ? form.rejectionReason
                                    : undefined
                              }
                          />

                          {/* Step 3: Admin Review */}
                          <TimelineStep
                              label="Admin Review"
                              date={form.adminReviewedAt}
                              isCompleted={form.state === FormState.ADMIN_APPROVED || form.state === FormState.MANAGER_APPROVED}
                              isRejected={form.state === FormState.ADMIN_REJECTED}
                              rejectionReason={
                                form.state === FormState.ADMIN_REJECTED
                                    ? form.rejectionReason
                                    : undefined
                              }
                          />

                          {/* Step 4: Manager Review */}
                          <TimelineStep
                              label="Manager Review"
                              date={form.managerReviewedAt}
                              isCompleted={form.state === FormState.MANAGER_APPROVED}
                              isRejected={form.state === FormState.MANAGER_REJECTED}
                              rejectionReason={
                                form.state === FormState.MANAGER_REJECTED
                                    ? form.rejectionReason
                                    : undefined
                              }
                          />
                        </div>
                      </div>
                    </div>
                )}
              </Card>
          );
        })}
      </div>
  );
};

// ✅ TIMELINE STEP COMPONENT
interface TimelineStepProps {
  label: string;
  date?: string;
  isCompleted: boolean;
  isRejected: boolean;
  rejectionReason?: string;
}

const TimelineStep: React.FC<TimelineStepProps> = ({
                                                     label,
                                                     date,
                                                     isCompleted,
                                                     isRejected,
                                                     rejectionReason,
                                                   }) => {
  // Determine icon and colors
  const getStepStyle = () => {
    if (isRejected) {
      return {
        bgColor: 'bg-red-500',
        textColor: 'text-red-700',
        icon: <XCircle className="h-4 w-4 text-white" />,
      };
    }
    if (isCompleted) {
      return {
        bgColor: 'bg-green-500',
        textColor: 'text-green-700',
        icon: <CheckCircle className="h-4 w-4 text-white" />,
      };
    }
    return {
      bgColor: 'bg-gray-300',
      textColor: 'text-gray-500',
      icon: <Clock className="h-4 w-4 text-white" />,
    };
  };

  const style = getStepStyle();

  return (
      <div className="relative flex items-start">
        {/* Circle indicator */}
        <div
            className={`z-10 flex items-center justify-center w-8 h-8 rounded-full ${style.bgColor}`}
        >
          {style.icon}
        </div>

        {/* Content */}
        <div className="ml-4 flex-1">
          <p className={`text-sm font-medium ${style.textColor}`}>
            {label}
            {!isCompleted && !isRejected && (
                <span className="ml-2 text-xs text-gray-400">(Pending)</span>
            )}
          </p>

          {date && (
              <p className="text-xs text-gray-500 mt-0.5">
                {new Date(date).toLocaleString()}
              </p>
          )}

          {isRejected && rejectionReason && (
              <p className="text-xs text-red-600 mt-1">
                Reason: {rejectionReason}
              </p>
          )}
        </div>
      </div>
  );
};
