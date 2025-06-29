'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
import { BookOpen, DollarSign, Edit, Eye, MoreHorizontal, Plus, Search, Star, Trash2, TrendingUp, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Course {
    _id: string;
    title: string;
    description: string;
    thumbnail: string;
    isPaid: boolean;
    price: number;
    isFeatured: boolean;
    slug: string;
    createdAt: string;
    categoryId: {
        _id: string;
        name: string;
    };
    enrollmentCount?: number;
    lessonCount?: number;
}

interface Category {
    _id: string;
    name: string;
}

export default function InstructorCourses() {
    const { data: session } = useSession();
    const [courses, setCourses] = useState<Course[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [courseType, setCourseType] = useState('all');
    const [stats, setStats] = useState<{ totalStudents: number; studentCounts: Record<string, number>; }>({ totalStudents: 0, studentCounts: {} });

    useEffect(() => {
        if (session?.user.id) {
            fetchCategories();
            fetchCourses();
            fetchStats();
        }
    }, [session, selectedCategory, courseType]);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            if (response.ok) {
                const data = await response.json();
                setCategories(data.categories);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchCourses = async () => {
        try {
            const params = new URLSearchParams();
            params.append('instructor', session?.user.id || '');
            if (selectedCategory !== 'all') params.append('category', selectedCategory);
            if (courseType !== 'all') params.append('type', courseType);

            const response = await fetch(`/api/courses?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                setCourses(data.courses);
            }
        } catch (error) {
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
            console.error('Failed to fetch stats:', error);
        }
    };

    const deleteCourse = async (courseId: string) => {
        try {
            const response = await fetch(`/api/courses/${courseId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setCourses(courses.filter(course => course._id !== courseId));
                toast.success('Course deleted successfully');
            } else {
                toast.error('Failed to delete course');
            }
        } catch (error) {
            toast.error('Failed to delete course');
        }
    };

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.categoryId.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const statsSummary = {
        totalCourses: courses.length,
        totalStudents: stats.totalStudents,
        totalRevenue: courses.filter(course => course.isPaid).reduce((sum, course) => sum + course.price, 0),
        avgEnrollment: courses.length > 0 ? Math.round(stats.totalStudents / courses.length) : 0,
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
                        <h1 className="text-3xl font-bold text-foreground">My Courses</h1>
                        <p className="text-muted-foreground">Manage your course content and track performance</p>
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
                            <div className="text-2xl font-bold text-foreground">{statsSummary.totalCourses}</div>
                            <p className="text-xs text-muted-foreground">
                                All your courses
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">Total Students</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{statsSummary.totalStudents}</div>
                            <p className="text-xs text-muted-foreground">
                                Enrolled students
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">${statsSummary.totalRevenue}</div>
                            <p className="text-xs text-muted-foreground">
                                From paid courses
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">Avg. Enrollment</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{statsSummary.avgEnrollment}</div>
                            <p className="text-xs text-muted-foreground">
                                Students per course
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <Select onValueChange={setSelectedCategory} defaultValue="all">
                        <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((category) => (
                                <SelectItem key={category._id} value={category._id}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select onValueChange={setCourseType} defaultValue="all">
                        <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Courses</SelectItem>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Courses Table */}
                <Card className="border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">Course Management</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            View and manage all your courses
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filteredCourses.length === 0 ? (
                            <div className="text-center py-12">
                                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2 text-foreground">
                                    {courses.length === 0 ? 'No courses created yet' : 'No courses match your filters'}
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    {courses.length === 0
                                        ? 'Create your first course to start teaching and earning.'
                                        : 'Try adjusting your search or filter criteria.'
                                    }
                                </p>
                                {courses.length === 0 && (
                                    <Link href="/instructor/courses/new">
                                        <Button>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Your First Course
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-foreground">Course</TableHead>
                                            <TableHead className="text-foreground">Category</TableHead>
                                            <TableHead className="text-foreground">Type</TableHead>
                                            <TableHead className="text-foreground">Students</TableHead>
                                            <TableHead className="text-foreground">Status</TableHead>
                                            <TableHead className="text-foreground">Created</TableHead>
                                            <TableHead className="text-foreground">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredCourses.map((course) => (
                                            <TableRow key={course._id}>
                                                <TableCell>
                                                    <div className="flex items-center space-x-3">
                                                        <img
                                                            src={course.thumbnail}
                                                            alt={course.title}
                                                            className="w-12 h-12 object-cover rounded"
                                                        />
                                                        <div>
                                                            <div className="font-medium text-foreground line-clamp-1">
                                                                {course.title}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground line-clamp-1">
                                                                {course.description}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {course.categoryId.name}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={course.isPaid ? "default" : "secondary"}>
                                                        {course.isPaid ? `$${course.price}` : 'Free'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-foreground">
                                                    <div className="flex items-center space-x-1">
                                                        <Users className="h-4 w-4 text-muted-foreground" />
                                                        <span>{stats.studentCounts[course._id] || 0} </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Badge variant="default" className="bg-green-600">
                                                            Published
                                                        </Badge>
                                                        {course.isFeatured && (
                                                            <Badge variant="default" className="bg-yellow-500">
                                                                <Star className="h-3 w-3 mr-1" />
                                                                Featured
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-foreground">
                                                    {new Date(course.createdAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/courses/${course.slug}`}>
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    View Course
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/instructor/courses/${course._id}/edit`}>
                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                    Edit Course
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <button className="flex items-center w-full px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                                            Delete Course
                                                                        </button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Delete Course</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                Are you sure you want to delete "{course.title}"? This action cannot be undone and will remove all associated lessons and enrollments.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction
                                                                                onClick={() => deleteCourse(course._id)}
                                                                                className="bg-red-600 hover:bg-red-700"
                                                                            >
                                                                                Delete
                                                                            </AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
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

                {/* Quick Actions */}
                {courses.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-border">
                            <CardHeader>
                                <CardTitle className="text-foreground">Recent Courses</CardTitle>
                                <CardDescription className="text-muted-foreground">Your latest course creations</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {courses.slice(0, 3).map((course) => (
                                        <div key={course._id} className="flex items-center space-x-4 p-3 border border-border rounded-lg">
                                            <img
                                                src={course.thumbnail}
                                                alt={course.title}
                                                className="w-12 h-12 object-cover rounded"
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-foreground line-clamp-1">{course.title}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {stats.studentCounts[course._id] || 0}  students • {course.isPaid ? `$${course.price}` : 'Free'}
                                                </p>
                                            </div>
                                            <Link href={`/instructor/courses/${course._id}/edit`}>
                                                <Button variant="outline" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border">
                            <CardHeader>
                                <CardTitle className="text-foreground">Course Performance</CardTitle>
                                <CardDescription className="text-muted-foreground">Overview of your teaching impact</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Most Popular Course</span>
                                        <span className="font-medium text-foreground">
                                            {courses.length > 0 ? courses[0].title.substring(0, 20) + '...' : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Total Enrollments</span>
                                        <span className="font-medium text-foreground">{stats.totalStudents}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Revenue This Month</span>
                                        <span className="font-medium text-foreground">${statsSummary.totalRevenue}</span>
                                    
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Course Completion Rate</span>
                                        <span className="font-medium text-foreground">85%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}