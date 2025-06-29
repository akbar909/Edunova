'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, DollarSign, Eye, Plus, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  isPaid: boolean;
  price: number;
  createdAt: string;
}

export default function InstructorDashboard() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ totalStudents: number; studentCounts: Record<string, number>; }>({ totalStudents: 0, studentCounts: {} });

  useEffect(() => {
    if (session?.user.id) {
      fetchCourses();
      fetchStats();
    }
  }, [session]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/courses?instructor=${session?.user.id}`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses);
      } else {
        setCourses([]);
      }
    } catch (error) {
      setCourses([]);
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/instructor/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      setStats({ totalStudents: 0, studentCounts: {} });
      console.error('Failed to fetch stats:', error);
    }
  };

  const totalRevenue = courses
    .filter(course => course.isPaid)
    .reduce((sum, course) => sum + course.price, 0);

  if (!session?.user.isApproved && session?.user.role === 'instructor') {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="bg-yellow-100 dark:bg-yellow-900/20 p-6 rounded-lg max-w-md mx-auto border border-yellow-200 dark:border-yellow-800">
            <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Account Pending Approval
            </h2>
            <p className="text-yellow-700 dark:text-yellow-300">
              Your instructor account is awaiting admin approval. Once approved, you'll be able to create and manage courses.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Instructor Dashboard</h1>
            <p className="text-muted-foreground">Manage your courses and track your performance</p>
          </div>
          <Link href="/instructor/courses/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{courses.length}</div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalStudents}</div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">${totalRevenue}</div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Course Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">0</div>
            </CardContent>
          </Card>
        </div>

        {/* My Courses */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">My Courses</CardTitle>
            <CardDescription className="text-muted-foreground">Manage and track your course performance</CardDescription>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-foreground">No courses yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first course to start teaching and earning.
                </p>
                <Link href="/instructor/courses/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Course
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {courses.map((course) => (
                  <div key={course._id} className="flex items-center space-x-4 p-4 border border-border rounded-lg">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{course.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <span>{course.isPaid ? `$${course.price}` : 'Free'}</span>
                        <span>•</span>
                        <span>{stats.studentCounts[course._id] || 0} students</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/instructor/courses/${course._id}/edit`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                      <Link href={`/courses/${course._id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}