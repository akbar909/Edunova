import { authOptions } from '@/lib/auth';
import Course from '@/lib/models/Course';
import Enrollment from '@/lib/models/Enrollment';
import connectDB from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'instructor' && session.user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role === 'instructor' && !session.user.isApproved) {
      return NextResponse.json(
        { error: 'Account not approved' },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const instructorId = searchParams.get('instructor');
    const courseFilter = searchParams.get('course');
    const progressFilter = searchParams.get('progress');

    if (!instructorId) {
      return NextResponse.json(
        { error: 'Instructor ID is required' },
        { status: 400 }
      );
    }

    // Get all courses by this instructor
    let courseQuery: any = { instructorId };
    if (courseFilter && courseFilter !== 'all') {
      courseQuery._id = courseFilter;
    }

    const instructorCourses = await Course.find(courseQuery);
    const courseIds = instructorCourses.map(course => course._id);

    if (courseIds.length === 0) {
      return NextResponse.json({ students: [] });
    }

    // Get all enrollments for instructor's courses
    const enrollments = await Enrollment.find({
      courseId: { $in: courseIds }
    })
    .populate('userId', 'name email')
    .populate('courseId', 'title slug')
    .sort({ enrolledAt: -1 });

    // Group enrollments by student
    const studentMap = new Map();

    enrollments.forEach(enrollment => {
      // Defensive: skip if userId or courseId is null (should not happen, but possible if data is corrupted)
      if (!enrollment.userId || !enrollment.courseId) return;
      const studentId = enrollment.userId._id?.toString();
      if (!studentId) return;

      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          _id: studentId,
          name: enrollment.userId.name,
          email: enrollment.userId.email,
          enrolledCourses: [],
          totalEnrollments: 0,
          averageProgress: 0,
          completedCourses: 0,
        });
      }

      const student = studentMap.get(studentId);
      student.enrolledCourses.push({
        courseId: {
          _id: enrollment.courseId._id,
          title: enrollment.courseId.title,
          slug: enrollment.courseId.slug,
        },
        progress: enrollment.progress,
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt,
        completedLessons: enrollment.completedLessons,
      });
    });

    // Calculate statistics for each student
    const students = Array.from(studentMap.values()).map(student => {
      student.totalEnrollments = student.enrolledCourses.length;
      student.averageProgress = student.enrolledCourses.length > 0
        ? Math.round(student.enrolledCourses.reduce((sum: number, course: any) => sum + course.progress, 0) / student.enrolledCourses.length)
        : 0;
      student.completedCourses = student.enrolledCourses.filter((course: any) => course.progress === 100).length;
      
      return student;
    });

    // Apply progress filter
    let filteredStudents = students;
    if (progressFilter && progressFilter !== 'all') {
      switch (progressFilter) {
        case 'not-started':
          filteredStudents = students.filter(s => s.averageProgress === 0);
          break;
        case 'in-progress':
          filteredStudents = students.filter(s => s.averageProgress > 0 && s.averageProgress < 100);
          break;
        case 'completed':
          filteredStudents = students.filter(s => s.completedCourses > 0);
          break;
      }
    }

    // Sort by most recent enrollment
    filteredStudents.sort((a, b) => {
      const aLatest = Math.max(...a.enrolledCourses.map((e: any) => new Date(e.enrolledAt).getTime()));
      const bLatest = Math.max(...b.enrolledCourses.map((e: any) => new Date(e.enrolledAt).getTime()));
      return bLatest - aLatest;
    });

    return NextResponse.json({ students: filteredStudents });
  } catch (error) {
    console.error('Failed to fetch students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}