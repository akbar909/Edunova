'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Award,
    BookOpen,
    Calendar,
    CheckCircle,
    Eye,
    Mail,
    MoreHorizontal,
    Search,
    TrendingUp,
    Users
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface Student {
    _id: string;
    name: string;
    email: string;
    enrolledCourses: {
        courseId: {
            _id: string;
            title: string;
            slug: string;
        };
        progress: number;
        enrolledAt: string;
        completedAt?: string;
        completedLessons: string[];
    }[];
    totalEnrollments: number;
    averageProgress: number;
    completedCourses: number;
}

interface Course {
    _id: string;
    title: string;
    slug: string;
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

export default function InstructorStudents() {
    const { data: session } = useSession();
    const [students, setStudents] = useState<Student[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('all');
    const [progressFilter, setProgressFilter] = useState('all');

    useEffect(() => {
        if (session?.user.id) {
            fetchStudents();
            fetchCourses();
        }
    }, [session, selectedCourse, progressFilter]);

    const fetchCourses = async () => {
        try {
            const response = await fetch(`/api/courses?instructor=${session?.user.id}`);
            if (response.ok) {
                const data = await response.json();
                setCourses(data.courses);
            }
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        }
    };

    const fetchStudents = async () => {
        try {
            const params = new URLSearchParams();
            params.append('instructor', session?.user.id || '');
            if (selectedCourse !== 'all') params.append('course', selectedCourse);
            if (progressFilter !== 'all') params.append('progress', progressFilter);

            const response = await fetch(`/api/instructor/students?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                setStudents(data.students);
            }
        } catch (error) {
            console.error('Failed to fetch students:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.enrolledCourses.some(enrollment =>
            enrollment.courseId.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const getProgressBadgeVariant = (progress: number) => {
        if (progress === 100) return 'default';
        if (progress >= 50) return 'secondary';
        return 'outline';
    };

    const getProgressStatus = (progress: number) => {
        if (progress === 0) return 'Not Started';
        if (progress === 100) return 'Completed';
        return 'In Progress';
    };

    const stats = {
        totalStudents: students.length,
        activeStudents: students.filter(s => s.averageProgress > 0 && s.averageProgress < 100).length,
        completedStudents: students.filter(s => s.completedCourses > 0).length,
        averageProgress: students.length > 0
            ? Math.round(students.reduce((sum, s) => sum + s.averageProgress, 0) / students.length)
            : 0,
    };

    if (!session?.user.isApproved && session?.user.role === 'instructor') {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <div className="bg-yellow-100 dark:bg-yellow-900/20 p-6 rounded-lg max-w-md mx-auto border border-yellow-200 dark:border-yellow-800">
                        <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                            Account Pending Approval
                        </h2>
                        <p className="text-yellow-700 dark:text-yellow-300">
                            Your instructor account is awaiting admin approval. Once approved, you'll be able to view your students.
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
                <div>
                    <h1 className="text-3xl font-bold text-foreground">My Students</h1>
                    <p className="text-muted-foreground">Track student progress and engagement across your courses</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">Total Students</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.totalStudents}</div>
                            <p className="text-xs text-muted-foreground">
                                Across all courses
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">Active Learners</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.activeStudents}</div>
                            <p className="text-xs text-muted-foreground">
                                Currently learning
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">Course Completions</CardTitle>
                            <Award className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.completedStudents}</div>
                            <p className="text-xs text-muted-foreground">
                                Students with completions
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">Avg. Progress</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.averageProgress}%</div>
                            <p className="text-xs text-muted-foreground">
                                Overall completion rate
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Search students or courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <Select onValueChange={setSelectedCourse} defaultValue="all">
                        <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="Filter by course" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Courses</SelectItem>
                            {courses.map((course) => (
                                <SelectItem key={course._id} value={course._id}>
                                    {course.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select onValueChange={setProgressFilter} defaultValue="all">
                        <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="Filter by progress" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Progress</SelectItem>
                            <SelectItem value="not-started">Not Started</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Students Table */}
                <Card className="border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">Student Overview</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Detailed view of student progress and engagement
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filteredStudents.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2 text-foreground">
                                    {students.length === 0 ? 'No students enrolled yet' : 'No students match your filters'}
                                </h3>
                                <p className="text-muted-foreground">
                                    {students.length === 0
                                        ? 'Students will appear here once they enroll in your courses.'
                                        : 'Try adjusting your search or filter criteria.'
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-foreground">Student</TableHead>
                                            <TableHead className="text-foreground">Enrolled Courses</TableHead>
                                            <TableHead className="text-foreground">Overall Progress</TableHead>
                                            <TableHead className="text-foreground">Completed</TableHead>
                                            <TableHead className="text-foreground">Last Activity</TableHead>
                                            <TableHead className="text-foreground">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredStudents.map((student) => (
                                            <TableRow key={student._id}>
                                                <TableCell>
                                                    <div className="flex items-center space-x-3">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarFallback>
                                                                {student.name.charAt(0).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium text-foreground">{student.name}</div>
                                                            <div className="text-sm text-muted-foreground">{student.email}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="text-sm font-medium text-foreground">
                                                            {student.totalEnrollments} course{student.totalEnrollments !== 1 ? 's' : ''}
                                                        </div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {student.enrolledCourses.slice(0, 2).map((enrollment) => (
                                                                <Badge key={enrollment.courseId._id} variant="outline" className="text-xs">
                                                                    {enrollment.courseId.title.length > 20
                                                                        ? enrollment.courseId.title.substring(0, 20) + '...'
                                                                        : enrollment.courseId.title
                                                                    }
                                                                </Badge>
                                                            ))}
                                                            {student.enrolledCourses.length > 2 && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    +{student.enrolledCourses.length - 2} more
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-medium text-foreground">
                                                                {student.averageProgress}%
                                                            </span>
                                                            <Badge variant={getProgressBadgeVariant(student.averageProgress)}>
                                                                {getProgressStatus(student.averageProgress)}
                                                            </Badge>
                                                        </div>
                                                        <ProgressBar value={student.averageProgress} className="w-full" />
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                        <span className="text-sm font-medium text-foreground">
                                                            {student.completedCourses}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-muted-foreground">
                                                        {student.enrolledCourses.length > 0
                                                            ? new Date(
                                                                Math.max(...student.enrolledCourses.map(e => new Date(e.enrolledAt).getTime()))
                                                            ).toLocaleDateString()
                                                            : 'N/A'
                                                        }
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem>
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Mail className="h-4 w-4 mr-2" />
                                                                Send Message
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Course Performance Breakdown */}
                {courses.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="border-border">
                            <CardHeader>
                                <CardTitle className="text-foreground">Course Performance</CardTitle>
                                <CardDescription className="text-muted-foreground">
                                    Student engagement by course
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {courses.slice(0, 5).map((course) => {
                                        const courseStudents = students.filter(s =>
                                            s.enrolledCourses.some(e => e.courseId._id === course._id)
                                        );
                                        const avgProgress = courseStudents.length > 0
                                            ? Math.round(
                                                courseStudents.reduce((sum, s) => {
                                                    const enrollment = s.enrolledCourses.find(e => e.courseId._id === course._id);
                                                    return sum + (enrollment?.progress || 0);
                                                }, 0) / courseStudents.length
                                            )
                                            : 0;

                                        return (
                                            <div key={course._id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-foreground line-clamp-1">{course.title}</h4>
                                                    <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                                                        <span>{courseStudents.length} students</span>
                                                        <span>•</span>
                                                        <span>{avgProgress}% avg. progress</span>
                                                    </div>
                                                </div>
                                                <div className="w-20">
                                                    <ProgressBar value={avgProgress} className="w-full" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border">
                            <CardHeader>
                                <CardTitle className="text-foreground">Recent Activity</CardTitle>
                                <CardDescription className="text-muted-foreground">
                                    Latest student enrollments and completions
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {students
                                        .flatMap(student =>
                                            student.enrolledCourses.map(enrollment => ({
                                                studentName: student.name,
                                                courseTitle: enrollment.courseId.title,
                                                enrolledAt: enrollment.enrolledAt,
                                                progress: enrollment.progress,
                                                completedAt: enrollment.completedAt,
                                            }))
                                        )
                                        .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())
                                        .slice(0, 5)
                                        .map((activity, index) => (
                                            <div key={index} className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-foreground">
                                                        {activity.studentName} enrolled in {activity.courseTitle}
                                                    </p>
                                                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>{new Date(activity.enrolledAt).toLocaleDateString()}</span>
                                                        {activity.completedAt && (
                                                            <>
                                                                <span>•</span>
                                                                <CheckCircle className="h-3 w-3 text-green-600" />
                                                                <span>Completed</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="text-xs">
                                                    {activity.progress}%
                                                </Badge>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}