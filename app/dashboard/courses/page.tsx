'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, BookOpen, Clock, Play, Search } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Enrollment {
    _id: string;
    progress: number;
    enrolledAt: string;
    completedAt?: string;
    courseId: {
        _id: string;
        title: string;
        description: string;
        thumbnail: string;
        isPaid: boolean;
        price: number;
        instructorId: {
            name: string;
        };
        categoryId: {
            name: string;
        };
    };
}

export default function MyCourses() {
    const { data: session } = useSession();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [progressFilter, setProgressFilter] = useState('all');

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

    const filteredEnrollments = enrollments.filter(enrollment => {
        const matchesSearch = enrollment.courseId.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enrollment.courseId.instructorId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enrollment.courseId.categoryId.name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesProgress = progressFilter === 'all' ||
            (progressFilter === 'not-started' && enrollment.progress === 0) ||
            (progressFilter === 'in-progress' && enrollment.progress > 0 && enrollment.progress < 100) ||
            (progressFilter === 'completed' && enrollment.progress === 100);

        return matchesSearch && matchesProgress;
    });

    const getProgressStatus = (progress: number) => {
        if (progress === 0) return { label: 'Not Started', color: 'bg-gray-500' };
        if (progress < 100) return { label: 'In Progress', color: 'bg-blue-500' };
        return { label: 'Completed', color: 'bg-green-500' };
    };

    const stats = {
        total: enrollments.length,
        notStarted: enrollments.filter(e => e.progress === 0).length,
        inProgress: enrollments.filter(e => e.progress > 0 && e.progress < 100).length,
        completed: enrollments.filter(e => e.progress === 100).length,
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

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">My Courses</h1>
                    <p className="text-muted-foreground">Track your learning progress and continue your journey</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">Total Courses</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">Not Started</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.notStarted}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">In Progress</CardTitle>
                            <Play className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.inProgress}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">Completed</CardTitle>
                            <Award className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.completed}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Search your courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <Select onValueChange={setProgressFilter} defaultValue="all">
                        <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="Filter by progress" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Courses</SelectItem>
                            <SelectItem value="not-started">Not Started</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Course List */}
                {filteredEnrollments.length === 0 ? (
                    <Card className="border-border">
                        <CardContent className="text-center py-12">
                            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2 text-foreground">
                                {enrollments.length === 0 ? 'No courses enrolled' : 'No courses match your filters'}
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                {enrollments.length === 0
                                    ? 'Start your learning journey by exploring our course catalog.'
                                    : 'Try adjusting your search or filter criteria.'
                                }
                            </p>
                            {enrollments.length === 0 && (
                                <Link href="/courses">
                                    <Button>Browse Courses</Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEnrollments.map((enrollment) => {
                            const status = getProgressStatus(enrollment.progress);
                            return (
                                <Card key={enrollment._id} className="border-border hover:shadow-lg transition-shadow duration-300">
                                    <div className="relative">
                                        <img
                                            src={enrollment.courseId.thumbnail}
                                            alt={enrollment.courseId.title}
                                            className="w-full h-48 object-cover rounded-t-lg"
                                        />
                                        <div className="absolute top-2 right-2">
                                            <Badge variant={enrollment.courseId.isPaid ? "default" : "secondary"}>
                                                {enrollment.courseId.isPaid ? `$${enrollment.courseId.price}` : 'Free'}
                                            </Badge>
                                        </div>
                                        <div className="absolute bottom-2 left-2">
                                            <div className={`px-2 py-1 rounded text-xs font-medium text-white ${status.color}`}>
                                                {status.label}
                                            </div>
                                        </div>
                                    </div>

                                    <CardHeader>
                                        <CardTitle className="line-clamp-2 text-foreground">
                                            {enrollment.courseId.title}
                                        </CardTitle>
                                        <CardDescription className="text-muted-foreground">
                                            by {enrollment.courseId.instructorId.name}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Progress</span>
                                                <span className="font-medium text-foreground"> {Math.min(enrollment.progress, 100)}%</span>
                                            </div>
                                            <ProgressBar value={enrollment.progress} className="w-full" />

                                            <div className="flex items-center justify-between">
                                                <Badge variant="outline">
                                                    {enrollment.courseId.categoryId.name}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <div className="flex space-x-2">
                                                <Link href={`/courses/${enrollment.courseId._id}`} className="flex-1">
                                                    <Button className="w-full" size="sm">
                                                        {enrollment.progress === 0 ? 'Start Learning' : 'Continue'}
                                                    </Button>
                                                </Link>
                                                <Link href={`/courses/${enrollment.courseId._id}`}>
                                                    <Button variant="outline" size="sm">
                                                        View Details
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

// Custom ProgressBar component
function ProgressBar({ value, className = '' }: { value: number, className?: string }) {
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