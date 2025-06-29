import { authOptions } from '@/lib/auth';
import Course from '@/lib/models/Course';
import Enrollment from '@/lib/models/Enrollment';
import connectDB from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'instructor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const instructorId = session.user.id;
    // Get all courses by this instructor
    const courses = await Course.find({ instructorId });
    const courseIds = courses.map((c: any) => c._id);
    // Get all enrollments for instructor's courses
    const enrollments = await Enrollment.find({ courseId: { $in: courseIds } });
    // Group by courseId
    const studentCounts: Record<string, number> = {};
    enrollments.forEach((enroll: any) => {
      const id = enroll.courseId.toString();
      studentCounts[id] = (studentCounts[id] || 0) + 1;
    });
    // Optionally, you could also return total students and total views (if tracked)
    return NextResponse.json({ studentCounts, totalStudents: enrollments.length });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch instructor stats' }, { status: 500 });
  }
}
