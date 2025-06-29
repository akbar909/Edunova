'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Navbar from '@/components/layout/Navbar';
import { Play, Clock, Download, Star, Users, CheckCircle, Lock, CreditCard, Shield, Zap } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  isPaid: boolean;
  price: number;
  slug: string;
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

export default function CourseDetailPage() {
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();
  const params = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
 useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && params.slug) {
      fetchCourse();
    }
  }, [mounted, params.slug]);

  useEffect(() => {
    if (mounted && session && course) {
      checkEnrollment();
    }
  }, [mounted, session, course]);

  if (!mounted) return null;

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${params.slug}`);
      if (response.ok) {
        const data = await response.json();
        setCourse(data.course);
        setLessons(data.lessons);
      }
    } catch (error) {
      console.error('Failed to fetch course:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const response = await fetch('/api/enrollments');
      if (response.ok) {
        const data = await response.json();
        const enrolled = data.enrollments.some((e: any) => e.courseId._id === course?._id);
        setIsEnrolled(enrolled);
      }
    } catch (error) {
      console.error('Failed to check enrollment:', error);
    }
  };

  const handleEnrollClick = () => {
    if (!session) {
      toast.error('Please sign in to enroll in courses');
      return;
    }

    if (course?.isPaid && course.price > 0) {
      setShowPaymentDialog(true);
    } else {
      handleFreeEnrollment();
    }
  };

  const handleFreeEnrollment = async () => {
    setEnrolling(true);
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId: course?._id }),
      });

      if (response.ok) {
        setIsEnrolled(true);
        toast.success('Successfully enrolled in course!');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to enroll in course');
      }
    } catch (error) {
      toast.error('Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  const handlePayment = async () => {
    setProcessingPayment(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // After successful payment, enroll the user
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          courseId: course?._id,
          paymentCompleted: true,
          amount: course?.price 
        }),
      });

      if (response.ok) {
        setIsEnrolled(true);
        setShowPaymentDialog(false);
        toast.success('Payment successful! You are now enrolled in the course.');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to complete enrollment');
      }
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

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

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-2">Course not found</h1>
            <p className="text-muted-foreground">The course you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-64 md:h-80 object-cover rounded-lg"
              />
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline">{course.categoryId.name}</Badge>
                <Badge variant={course.isPaid ? "default" : "secondary"}>
                  {course.isPaid ? `$${course.price}` : 'Free'}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {course.title}
              </h1>
              <p className="text-muted-foreground mb-4">
                by <span className="font-semibold">{course.instructorId.name}</span>
              </p>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>4.8 (234 reviews)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>1,234 students</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{lessons.length} lessons</span>
                </div>
              </div>
            </div>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">About this course</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {course.description}
                </p>
              </CardContent>
            </Card>

            {/* Course Curriculum */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Course Curriculum</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {lessons.length} lessons in this course
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lessons.map((lesson, index) => (
                    <div key={lesson._id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {isEnrolled ? (
                            <Play className="h-5 w-5 text-primary" />
                          ) : (
                            <Lock className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {index + 1}. {lesson.title}
                          </p>
                          {lesson.duration && (
                            <p className="text-sm text-muted-foreground">{lesson.duration} minutes</p>
                          )}
                        </div>
                      </div>
                      {lesson.notesUrl && isEnrolled && (
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-center text-foreground">
                  {course.isPaid ? `$${course.price}` : 'Free Course'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEnrolled ? (
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                    <p className="text-green-600 font-semibold">Enrolled</p>
                    <Button className="w-full mt-4" asChild>
                      <Link href={`/courses/${course.slug}/watch`}>
                        Start Learning
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={handleEnrollClick}
                    disabled={enrolling}
                  >
                    {enrolling ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enrolling...
                      </>
                    ) : course.isPaid ? (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Buy Now - ${course.price}
                      </>
                    ) : (
                      'Enroll Now'
                    )}
                  </Button>
                )}

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Lessons</span>
                    <span className="font-semibold text-foreground">{lessons.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-semibold text-foreground">
                      {lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0)} minutes
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Skill Level</span>
                    <span className="font-semibold text-foreground">Beginner</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Language</span>
                    <span className="font-semibold text-foreground">English</span>
                  </div>
                </div>

                {course.isPaid && !isEnrolled && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Shield className="h-4 w-4" />
                        <span>30-day money-back guarantee</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Zap className="h-4 w-4" />
                        <span>Instant access after purchase</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary-foreground font-semibold text-lg">
                      {course.instructorId.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground">{course.instructorId.name}</h3>
                  <p className="text-sm text-muted-foreground">Professional Instructor</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Complete Your Purchase</span>
            </DialogTitle>
            <DialogDescription>
              You're about to purchase "{course.title}" for ${course.price}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Course:</span>
                <span className="text-sm">{course.title}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Instructor:</span>
                <span className="text-sm">{course.instructorId.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Price:</span>
                <span className="text-lg font-bold">${course.price}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Secure payment processing</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4" />
                <span>Instant access after payment</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handlePayment}
              disabled={processingPayment}
              className="w-full"
            >
              {processingPayment ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay ${course.price}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPaymentDialog(false)}
              disabled={processingPayment}
              className="w-full"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}