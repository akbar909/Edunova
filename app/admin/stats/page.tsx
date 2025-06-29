'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
    Users,
    BookOpen,
    GraduationCap,
    TrendingUp,
    UserCheck,
    AlertCircle,
    DollarSign,
    Eye,
    Calendar,
    Award
} from 'lucide-react';

interface DetailedStats {
    totalUsers: number;
    totalStudents: number;
    totalInstructors: number;
    totalCourses: number;
    totalEnrollments: number;
    pendingInstructors: number;
    totalRevenue: number;
    freeCoursesCount: number;
    paidCoursesCount: number;
    featuredCoursesCount: number;
    averageEnrollmentsPerCourse: number;
    topCategories: Array<{
        name: string;
        courseCount: number;
    }>;
    topInstructors: Array<{
        name: string;
        courseCount: number;
        enrollmentCount: number;
    }>;
    recentActivity: Array<{
        type: string;
        description: string;
        timestamp: string;
    }>;
    monthlyGrowth: {
        users: number;
        courses: number;
        enrollments: number;
    };
}

export default function AdminStats() {
    const [stats, setStats] = useState<DetailedStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDetailedStats();
    }, []);

    const fetchDetailedStats = async () => {
        try {
            const response = await fetch('/api/admin/detailed-stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch detailed stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!stats) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold text-foreground mb-2">Failed to load statistics</h2>
                    <p className="text-muted-foreground">Please try refreshing the page.</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Platform Statistics</h1>
                    <p className="text-muted-foreground">Comprehensive analytics and insights</p>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.totalUsers}</div>
                            <p className="text-xs text-green-600 dark:text-green-400">
                                +{stats.monthlyGrowth.users} this month
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">Total Courses</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.totalCourses}</div>
                            <p className="text-xs text-green-600 dark:text-green-400">
                                +{stats.monthlyGrowth.courses} this month
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">Total Enrollments</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.totalEnrollments}</div>
                            <p className="text-xs text-green-600 dark:text-green-400">
                                +{stats.monthlyGrowth.enrollments} this month
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">${stats.totalRevenue}</div>
                            <p className="text-xs text-muted-foreground">
                                From paid courses
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">Students</CardTitle>
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.totalStudents}</div>
                            <p className="text-xs text-muted-foreground">Active learners</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">Instructors</CardTitle>
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.totalInstructors}</div>
                            <p className="text-xs text-muted-foreground">Course creators</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">Pending Approvals</CardTitle>
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.pendingInstructors}</div>
                            <p className="text-xs text-muted-foreground">Instructor approvals needed</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Course Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">Free Courses</CardTitle>
                            <BookOpen className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.freeCoursesCount}</div>
                            <p className="text-xs text-muted-foreground">
                                {((stats.freeCoursesCount / stats.totalCourses) * 100).toFixed(1)}% of total
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">Paid Courses</CardTitle>
                            <DollarSign className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.paidCoursesCount}</div>
                            <p className="text-xs text-muted-foreground">
                                {((stats.paidCoursesCount / stats.totalCourses) * 100).toFixed(1)}% of total
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">Featured Courses</CardTitle>
                            <Award className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.featuredCoursesCount}</div>
                            <p className="text-xs text-muted-foreground">
                                {((stats.featuredCoursesCount / stats.totalCourses) * 100).toFixed(1)}% of total
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Detailed Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="border-border">
                        <CardHeader>
                            <CardTitle className="text-foreground">Top Categories</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Most popular course categories
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {stats.topCategories.map((category, index) => (
                                    <div key={category.name} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-semibold text-primary">
                                                    {index + 1}
                                                </span>
                                            </div>
                                            <span className="font-medium text-foreground">{category.name}</span>
                                        </div>
                                        <span className="text-muted-foreground">{category.courseCount} courses</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border">
                        <CardHeader>
                            <CardTitle className="text-foreground">Top Instructors</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Most active course creators
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {stats.topInstructors.map((instructor, index) => (
                                    <div key={instructor.name} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-semibold text-primary">
                                                    {index + 1}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-foreground block">{instructor.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {instructor.enrollmentCount} enrollments
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-muted-foreground">{instructor.courseCount} courses</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Platform Metrics */}
                <Card className="border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">Platform Metrics</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Key performance indicators
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-foreground mb-1">
                                    {stats.averageEnrollmentsPerCourse.toFixed(1)}
                                </div>
                                <p className="text-sm text-muted-foreground">Average enrollments per course</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-foreground mb-1">
                                    {((stats.totalEnrollments / stats.totalUsers) * 100).toFixed(1)}%
                                </div>
                                <p className="text-sm text-muted-foreground">Avg. enrollments per user</p>
                            </div>

                            <div className="text-center">
                                <div className="text-2xl font-bold text-foreground mb-1">
                                    {stats.totalRevenue > 0 ? (stats.totalRevenue / stats.paidCoursesCount).toFixed(0) : 0}
                                </div>
                                <p className="text-sm text-muted-foreground">Average revenue per paid course</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}