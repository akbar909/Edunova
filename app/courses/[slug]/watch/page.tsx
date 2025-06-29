'use client';

import Navbar from '@/components/layout/Navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  CheckCircle,
  Circle,
  Clock,
  Download,
  FileText,
  Lock,
  Play,
  SkipBack,
  SkipForward
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructorId: {
    _id: string;
    name: string;
  };
  categoryId: {
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

interface Enrollment {
  _id: string;
  progress: number;
  completedLessons: string[];
}

export default function CourseWatchPage() {

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);



  const fetchCourseData = async () => {
    try {
      const response = await fetch(`/api/courses/${params.slug}`);
      if (response.ok) {
        const data = await response.json();
        setCourse(data.course);
        setLessons(data.lessons.sort((a: Lesson, b: Lesson) => a.order - b.order));

        // Set first lesson as current if no lesson is selected
        if (data.lessons.length > 0) {
          setCurrentLesson(data.lessons.sort((a: Lesson, b: Lesson) => a.order - b.order)[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch course:', error);
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };
  const checkEnrollment = async () => {
    try {
      const response = await fetch('/api/enrollments');
      if (response.ok) {
        const data = await response.json();
        const courseEnrollment = data.enrollments.find((e: any) =>
          e.courseId._id === course?._id || e.courseId.slug === params.slug
        );
        setEnrollment(courseEnrollment || null);
      }
    } catch (error) {
      console.error('Failed to check enrollment:', error);
    }
  };
  
    useEffect(() => {
    if (params.slug && session) {
      fetchCourseData();
      checkEnrollment();
    }
  }, [params.slug, session]);

  if (!mounted) return null;


  const markLessonComplete = async (lessonId: string) => {
    if (!enrollment) return;
    if (enrollment.completedLessons.includes(lessonId)) return;
    try {
      const response = await fetch(`/api/enrollments/${enrollment._id}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId,
          completed: true
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setEnrollment(data.enrollment);
        toast.success('Lesson marked as complete!');
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const selectLesson = (lesson: Lesson) => {
    setVideoLoading(true);
    setCurrentLesson(lesson);
    setIsPlaying(false);
    setTimeout(() => setVideoLoading(false), 1000);
  };

  const goToNextLesson = () => {
    if (!currentLesson) return;

    const currentIndex = lessons.findIndex(l => l._id === currentLesson._id);
    if (currentIndex < lessons.length - 1) {
      selectLesson(lessons[currentIndex + 1]);
    }
  };

  const goToPreviousLesson = () => {
    if (!currentLesson) return;

    const currentIndex = lessons.findIndex(l => l._id === currentLesson._id);
    if (currentIndex > 0) {
      selectLesson(lessons[currentIndex - 1]);
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return enrollment?.completedLessons.includes(lessonId) || false;
  };

  const calculateProgress = () => {
    if (!enrollment || lessons.length === 0) return 0;
    const percent = Math.round((enrollment.completedLessons.length / lessons.length) * 100);
    return percent > 100 ? 100 : percent;
  };

  // Only show sign-in required if status is not loading and session is null
  if (status !== 'loading' && !session) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-2">Sign in required</h1>
            <p className="text-muted-foreground mb-4">Please sign in to access course content.</p>
            <Link href="/auth/signin">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!course || !enrollment) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-4">
              You need to enroll in this course to access the content.
            </p>
            <Link href={`/courses/${params.slug}`}>
              <Button>View Course Details</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href={`/courses/${params.slug}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Course
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{course.title}</h1>
              <p className="text-muted-foreground">by {course.instructorId.name}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Progress</div>
            <div className="flex items-center space-x-2">
              <Progress value={calculateProgress()} className="w-32" />
              <span className="text-sm font-medium text-foreground">{calculateProgress()}%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="border-border">
              <CardContent className="p-0">
                {currentLesson ? (
                  <div className="relative">
                    {videoLoading ? (
                      <div className="aspect-video bg-black flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                      </div>
                    ) : (
                      <video
                        key={currentLesson._id}
                        className="w-full aspect-video"
                        controls
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => {
                          markLessonComplete(currentLesson._id);
                          goToNextLesson();
                        }}
                      >
                        <source src={currentLesson.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <div className="text-center">
                      <Play className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Select a lesson to start learning</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Video Controls */}
            {currentLesson && (
              <Card className="border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-foreground">
                        Lesson {currentLesson.order}: {currentLesson.title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {currentLesson.duration && `${currentLesson.duration} minutes`}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isLessonCompleted(currentLesson._id) ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => markLessonComplete(currentLesson._id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPreviousLesson}
                        disabled={lessons.findIndex(l => l._id === currentLesson._id) === 0}
                      >
                        <SkipBack className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextLesson}
                        disabled={lessons.findIndex(l => l._id === currentLesson._id) === lessons.length - 1}
                      >
                        Next
                        <SkipForward className="h-4 w-4 ml-1" />
                      </Button>
                    </div>

                    {currentLesson.notesUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={`https://docs.google.com/gview?url=${encodeURIComponent(currentLesson.notesUrl)}&embedded=true`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          View Notes (Google Docs)
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Lesson Sidebar */}
          <div className="space-y-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Course Content</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {lessons.length} lessons • {enrollment.completedLessons.length} completed
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-96">
                  <div className="p-4 space-y-2">
                    {lessons.map((lesson) => (
                      <div
                        key={lesson._id}
                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${currentLesson?._id === lesson._id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent'
                          }`}
                        onClick={() => selectLesson(lesson)}
                      >
                        <div className="flex-shrink-0">
                          {isLessonCompleted(lesson._id) ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate ${currentLesson?._id === lesson._id ? 'text-primary-foreground' : 'text-foreground'
                            }`}>
                            {lesson.order}. {lesson.title}
                          </p>
                          <div className="flex items-center space-x-2 text-sm">
                            <Clock className="h-3 w-3" />
                            <span className={
                              currentLesson?._id === lesson._id ? 'text-primary-foreground/80' : 'text-muted-foreground'
                            }>
                              {lesson.duration || 0} min
                            </span>
                            {lesson.notesUrl && (
                              <>
                                <FileText className="h-3 w-3" />
                                <span className={
                                  currentLesson?._id === lesson._id ? 'text-primary-foreground/80' : 'text-muted-foreground'
                                }>
                                  Notes
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Course Info */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">About This Course</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Category</span>
                    <Badge variant="outline">{course.categoryId.name}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Lessons</span>
                    <span className="font-medium text-foreground">{lessons.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-medium text-foreground">{enrollment.completedLessons.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">{calculateProgress()}%</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div>
                  <h4 className="font-medium text-foreground mb-2">Instructor</h4>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-semibold">
                        {course.instructorId.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{course.instructorId.name}</p>
                      <p className="text-sm text-muted-foreground">Course Instructor</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}