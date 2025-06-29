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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { FileUpload } from '@/components/ui/file-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Edit, FileText, Plus, Save, Trash2, Video } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Course {
    _id: string;
    title: string;
    description: string;
    thumbnail: string;
    isPaid: boolean;
    price: number;
    // categoryId: string;
    instructorId: {
        name: string;
    };
    categoryId: {
        _id: string;
        name: string;
    };
}

interface Lesson {
    _id: string;
    title: string;
    videoUrl: string;
    notesUrl?: string;
    order: number;
    duration?: number;
}

interface Category {
    _id: string;
    name: string;
}

export default function EditCourse() {
    const params = useParams();
    const router = useRouter();
    const [course, setCourse] = useState<Course | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

    const [courseData, setCourseData] = useState({
        title: '',
        description: '',
        thumbnail: '',
        categoryId: '',
        isPaid: false,
        price: 0,
    });

    const [lessonData, setLessonData] = useState({
        title: '',
        videoUrl: '',
        notesUrl: '',
        order: 1,
        duration: 0,
    });

    useEffect(() => {
        if (params.id) {
            fetchCourse();
            fetchCategories();
        }
    }, [params.id]);

    const fetchCourse = async () => {
        try {
            const response = await fetch(`/api/courses/${params.id}`);
            if (response.ok) {
                const data = await response.json();
                setCourse(data.course);
                setLessons(data.lessons);
                setCourseData({
                    title: data.course.title,
                    description: data.course.description,
                    thumbnail: data.course.thumbnail,
                    categoryId: data.course.categoryId._id,
                    isPaid: data.course.isPaid,
                    price: data.course.price,
                });
            }
        } catch (error) {
            console.error('Failed to fetch course:', error);
            toast.error('Failed to load course');
        } finally {
            setLoading(false);
        }
    };

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

    const handleCourseUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const response = await fetch(`/api/courses/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(courseData),
            });

            if (response.ok) {
                const data = await response.json();
                setCourse(data.course);
                toast.success('Course updated successfully!');
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to update course');
            }
        } catch (error) {
            toast.error('Failed to update course');
        } finally {
            setSaving(false);
        }
    };

    const handleLessonSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingLesson
                ? `/api/lessons/${editingLesson._id}`
                : `/api/courses/${params.id}/lessons`;

            const method = editingLesson ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(lessonData),
            });

            if (response.ok) {
                const data = await response.json();

                if (editingLesson) {
                    setLessons(lessons.map(lesson =>
                        lesson._id === editingLesson._id ? data.lesson : lesson
                    ));
                    toast.success('Lesson updated successfully');
                } else {
                    setLessons([...lessons, data.lesson]);
                    toast.success('Lesson added successfully');
                }

                setDialogOpen(false);
                setEditingLesson(null);
                setLessonData({
                    title: '',
                    videoUrl: '',
                    notesUrl: '',
                    order: lessons.length + 1,
                    duration: 0,
                });
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to save lesson');
            }
        } catch (error) {
            toast.error('Failed to save lesson');
        }
    };

    const deleteLesson = async (lessonId: string) => {
        try {
            const response = await fetch(`/api/lessons/${lessonId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setLessons(lessons.filter(lesson => lesson._id !== lessonId));
                toast.success('Lesson deleted successfully');
            } else {
                toast.error('Failed to delete lesson');
            }
        } catch (error) {
            toast.error('Failed to delete lesson');
        }
    };

    const openEditDialog = (lesson: Lesson) => {
        setEditingLesson(lesson);
        setLessonData({
            title: lesson.title,
            videoUrl: lesson.videoUrl,
            notesUrl: lesson.notesUrl || '',
            order: lesson.order,
            duration: lesson.duration || 0,
        });
        setDialogOpen(true);
    };

    const openCreateDialog = () => {
        setEditingLesson(null);
        setLessonData({
            title: '',
            videoUrl: '',
            notesUrl: '',
            order: lessons.length + 1,
            duration: 0,
        });
        setDialogOpen(true);
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

    if (!course) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold text-foreground mb-2">Course not found</h2>
                    <p className="text-muted-foreground">The course you're looking for doesn't exist.</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/instructor/dashboard">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Edit Course</h1>
                            <p className="text-muted-foreground">Manage course content and lessons</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Course Information */}
                    <Card className="border-border">
                        <CardHeader>
                            <CardTitle className="text-foreground">Course Information</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Update your course details
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCourseUpdate} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Course Title</Label>
                                    <Input
                                        id="title"
                                        value={courseData.title}
                                        onChange={(e) => setCourseData(prev => ({ ...prev, title: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={courseData.description}
                                        onChange={(e) => setCourseData(prev => ({ ...prev, description: e.target.value }))}
                                        rows={4}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Course Thumbnail</Label>
                                    <FileUpload
                                        onUpload={(url) => setCourseData(prev => ({ ...prev, thumbnail: url }))}
                                        accept="image/*"
                                        type="image"
                                    />
                                    {courseData.thumbnail && (
                                        <div className="mt-2">
                                            <img
                                                src={courseData.thumbnail}
                                                alt="Course thumbnail"
                                                className="w-32 h-20 object-cover rounded"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        onValueChange={(value) => setCourseData(prev => ({ ...prev, categoryId: value }))}
                                        value={courseData.categoryId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category._id} value={category._id}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="isPaid"
                                            checked={courseData.isPaid}
                                            onCheckedChange={(checked) => setCourseData(prev => ({ ...prev, isPaid: checked }))}
                                        />
                                        <Label htmlFor="isPaid">This is a paid course</Label>
                                    </div>

                                    {courseData.isPaid && (
                                        <div className="space-y-2">
                                            <Label htmlFor="price">Price ($)</Label>
                                            <Input
                                                id="price"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={courseData.price}
                                                onChange={(e) => setCourseData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                                            />
                                        </div>
                                    )}
                                </div>

                                <Button type="submit" disabled={saving} className="w-full">
                                    <Save className="h-4 w-4 mr-2" />
                                    {saving ? 'Saving...' : 'Save Course'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Course Lessons */}
                    <Card className="border-border">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-foreground">Course Lessons</CardTitle>
                                    <CardDescription className="text-muted-foreground">
                                        Manage your course content
                                    </CardDescription>
                                </div>
                                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button onClick={openCreateDialog}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Lesson
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>
                                                {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
                                            </DialogTitle>
                                            <DialogDescription>
                                                {editingLesson
                                                    ? 'Update the lesson information'
                                                    : 'Add a new lesson to your course'
                                                }
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleLessonSubmit}>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="lessonTitle">Lesson Title</Label>
                                                    <Input
                                                        id="lessonTitle"
                                                        value={lessonData.title}
                                                        onChange={(e) => setLessonData(prev => ({ ...prev, title: e.target.value }))}
                                                        placeholder="Enter lesson title"
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Video Upload</Label>
                                                    <FileUpload
                                                        onUpload={(url) => setLessonData(prev => ({ ...prev, videoUrl: url }))}
                                                        accept="video/*"
                                                        type="video"
                                                    />
                                                    {lessonData.videoUrl && (
                                                        <div className="mt-2">
                                                            <video
                                                                src={lessonData.videoUrl}
                                                                className="w-full h-32 object-cover rounded"
                                                                controls
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Notes/Resources (Optional)</Label>
                                                    <FileUpload
                                                        onUpload={(url) => setLessonData(prev => ({ ...prev, notesUrl: url }))}
                                                        accept=".pdf,.doc,.docx"
                                                        type="auto"
                                                    />
                                                    {lessonData.notesUrl && (
                                                        <div className="mt-2 flex items-center space-x-2">
                                                            <FileText className="h-4 w-4" />
                                                            <span className="text-sm text-muted-foreground">File uploaded</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="order">Lesson Order</Label>
                                                        <Input
                                                            id="order"
                                                            type="number"
                                                            min="1"
                                                            value={lessonData.order}
                                                            onChange={(e) => setLessonData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                                                            required
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="duration">Duration (minutes)</Label>
                                                        <Input
                                                            id="duration"
                                                            type="number"
                                                            min="0"
                                                            value={lessonData.duration}
                                                            onChange={(e) => setLessonData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <DialogFooter className="mt-6">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setDialogOpen(false)}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={!lessonData.title || !lessonData.videoUrl || loading }
                                                >
                                                    {editingLesson ? 'Update' : 'Add'} Lesson
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {lessons.length === 0 ? (
                                <div className="text-center py-8">
                                    <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2 text-foreground">No lessons yet</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Add your first lesson to start building your course content.
                                    </p>
                                    <Button onClick={openCreateDialog}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add First Lesson
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {lessons
                                        .sort((a, b) => a.order - b.order)
                                        .map((lesson) => (
                                            <div key={lesson._id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0">
                                                        <Video className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground">
                                                            {lesson.order}. {lesson.title}
                                                        </p>
                                                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                                            {lesson.duration && <span>{lesson.duration} minutes</span>}
                                                            {lesson.notesUrl && (
                                                                <span className="flex items-center space-x-1">
                                                                    <FileText className="h-3 w-3" />
                                                                    <span>Notes included</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => openEditDialog(lesson)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button size="sm" variant="destructive">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete "{lesson.title}"? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => deleteLesson(lesson._id)}
                                                                    className="bg-red-600 hover:bg-red-700"
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}