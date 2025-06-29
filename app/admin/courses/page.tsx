'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Search, Eye, Trash2, Star, StarOff, Edit } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Course {
    _id: string;
    title: string;
    description: string;
    thumbnail: string;
    isPaid: boolean;
    price: number;
    isFeatured: boolean;
    createdAt: string;
    instructorId: {
        _id: string;
        name: string;
    };
    categoryId: {
        name: string;
    };
}

interface Category {
    _id: string;
    name: string;
}

export default function AdminCourses() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [courseType, setCourseType] = useState('all');

    useEffect(() => {
        fetchCategories();
        fetchCourses();
    }, [selectedCategory, courseType]);

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

    const toggleFeatured = async (courseId: string, isFeatured: boolean) => {
        try {
            const response = await fetch(`/api/courses/${courseId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isFeatured: !isFeatured }),
            });

            if (response.ok) {
                const data = await response.json();
                setCourses(courses.map(course =>
                    course._id === courseId ? { ...course, isFeatured: !isFeatured } : course
                ));
                toast.success(`Course ${!isFeatured ? 'featured' : 'unfeatured'} successfully`);
            } else {
                toast.error('Failed to update course');
            }
        } catch (error) {
            toast.error('Failed to update course');
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
        course.instructorId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.categoryId.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <h1 className="text-3xl font-bold text-foreground">Course Management</h1>
                    <p className="text-muted-foreground">Manage all courses on the platform</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Search courses, instructors, or categories..."
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

                <Card className="border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">Courses ({filteredCourses.length})</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Manage course visibility, features, and content
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-foreground">Course</TableHead>
                                    <TableHead className="text-foreground">Instructor</TableHead>
                                    <TableHead className="text-foreground">Category</TableHead>
                                    <TableHead className="text-foreground">Type</TableHead>
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
                                        <TableCell className="text-foreground">
                                            {course.instructorId.name}
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
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                {course.isFeatured ? (

                                                    <Badge variant="default" className="bg-yellow-500">
                                                        Featured
                                                    </Badge>
                                                )
                                                    : (
                                                        <Badge variant="secondary">
                                                            Not Featured
                                                        </Badge>
                                                    )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-foreground">
                                            {new Date(course.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Link href={`/courses/${course._id}`}>
                                                    <Button size="sm" variant="outline">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => toggleFeatured(course._id, course.isFeatured)}
                                                >
                                                    {course.isFeatured ? (
                                                        <StarOff className="h-4 w-4" />
                                                    ) : (
                                                        <Star className="h-4 w-4" />
                                                    )}
                                                </Button>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button size="sm" variant="destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
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
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}