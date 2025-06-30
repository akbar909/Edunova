'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, BookOpen, Clock, GraduationCap } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Enrollment {
  _id: string;
  progress: number;
  enrolledAt: string;
  courseId: {
    _id: string;
    title: string;
    description: string;
    thumbnail: string;
    instructorId: {
      name: string;
    };
  };
}

function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  const percent = Math.max(0, Math.min(100, value));
  return (
    <div className={`relative h-3 w-full bg-gray-200 rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-blue-600 transition-all"
        style={{ width: `${percent}%` }}
      />
      <span className="absolute inset-0 flex items-center justify-center text-xs text-black font-semibold">
        {percent}%
      </span>
    </div>
  );
}

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await fetch('/api/enrollments');
      if (response.ok) {
        const data = await response.json();
        setEnrollments(data.enrollments);
      }
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const inProgressCourses = enrollments.filter(e => e.progress > 0 && e.progress < 100);
  const completedCourses = enrollments.filter(e => e.progress === 100);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {session?.user.name}!
          </h1>
          <p className="text-muted-foreground">Continue your learning journey</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{enrollments.length}</div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{inProgressCourses.length}</div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Completed</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{completedCourses.length}</div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Average Progress</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {enrollments.length > 0
                  ? Math.min(
                      Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length),
                      100
                    )
                  : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Continue Learning */}
        {inProgressCourses.length > 0 && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Continue Learning</CardTitle>
              <CardDescription className="text-muted-foreground">Pick up where you left off</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inProgressCourses.slice(0, 3).map((enrollment) => (
                  <div key={enrollment._id} className="flex items-center space-x-4 p-4 border border-border rounded-lg">
                    <img
                      src={enrollment.courseId.thumbnail}
                      alt={enrollment.courseId.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{enrollment.courseId.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        by {enrollment.courseId.instructorId.name}
                      </p>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="text-foreground">{enrollment.progress}%</span>
                        </div>
                        <ProgressBar value={enrollment.progress} className="mt-1" />
                      </div>
                    </div>
                    <Link href={`/courses/${enrollment.courseId._id}`}>
                      <Button>Continue</Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Enrollments */}
        {enrollments.length === 0 ? (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Get Started</CardTitle>
              <CardDescription className="text-muted-foreground">You haven't enrolled in any courses yet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-foreground">No courses yet</h3>
                <p className="text-muted-foreground mb-4">
                  Explore our course catalog and start learning something new today!
                </p>
                <Link href="/courses">
                  <Button>Browse Courses</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Enrollments</CardTitle>
              <CardDescription className="text-muted-foreground">Your latest course enrollments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enrollments.slice(0, 5).map((enrollment) => (
                  <div key={enrollment._id} className="flex items-center space-x-4 p-4 border border-border rounded-lg">
                    <img
                      src={enrollment.courseId.thumbnail}
                      alt={enrollment.courseId.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{enrollment.courseId.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        by {enrollment.courseId.instructorId.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {Math.min(enrollment.progress, 100)}% complete
                      </p>
                      <ProgressBar value={enrollment.progress} className="w-20 mt-1" />
                    </div>
                    <Link href={`/courses/${enrollment.courseId._id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}