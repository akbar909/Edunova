import { authOptions } from '@/lib/auth';
import Category from '@/lib/models/Category';
import Course from '@/lib/models/Course';
import Enrollment from '@/lib/models/Enrollment';
import User from '@/lib/models/User';
import connectDB from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get current date for monthly growth calculation
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    const [
      totalUsers,
      totalStudents,
      totalInstructors,
      totalCourses,
      totalEnrollments,
      pendingInstructors,
      freeCoursesCount,
      paidCoursesCount,
      featuredCoursesCount,
      monthlyUsers,
      monthlyCourses,
      monthlyEnrollments,
      categories,
      courses,
      instructors,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'instructor' }),
      Course.countDocuments(),
      Enrollment.countDocuments(),
      User.countDocuments({ role: 'instructor', isApproved: false }),
      Course.countDocuments({ isPaid: false }),
      Course.countDocuments({ isPaid: true }),
      Course.countDocuments({ isFeatured: true }),
      User.countDocuments({ createdAt: { $gte: firstDayOfMonth } }),
      Course.countDocuments({ createdAt: { $gte: firstDayOfMonth } }),
      Enrollment.countDocuments({ enrolledAt: { $gte: firstDayOfMonth } }),
      Category.find(),
      Course.find().populate('categoryId', 'name').populate('instructorId', 'name'),
      User.find({ role: 'instructor' }),
    ]);

    // Calculate total revenue
    const paidCourses = await Course.find({ isPaid: true });
    const totalRevenue = paidCourses.reduce((sum, course) => sum + course.price, 0);

    // Calculate average enrollments per course
    const averageEnrollmentsPerCourse = totalCourses > 0 ? totalEnrollments / totalCourses : 0;

    // Get top categories
    const categoryStats = categories.map(category => {
      const courseCount = courses.filter(course => 
        course.categoryId && course.categoryId._id.toString() === category._id.toString()
      ).length;
      return {
        name: category.name,
        courseCount,
      };
    }).sort((a, b) => b.courseCount - a.courseCount).slice(0, 5);

    // Get top instructors
    const instructorStats = await Promise.all(
      instructors.map(async (instructor) => {
        const instructorCourses = courses.filter(course => 
          course.instructorId && course.instructorId._id.toString() === instructor._id.toString()
        );
        const enrollmentCount = await Enrollment.countDocuments({
          courseId: { $in: instructorCourses.map(c => c._id) }
        });
        
        return {
          name: instructor.name,
          courseCount: instructorCourses.length,
          enrollmentCount,
        };
      })
    );

    const topInstructors = instructorStats
      .sort((a, b) => b.courseCount - a.courseCount)
      .slice(0, 5);

    return NextResponse.json({
      totalUsers,
      totalStudents,
      totalInstructors,
      totalCourses,
      totalEnrollments,
      pendingInstructors,
      totalRevenue,
      freeCoursesCount,
      paidCoursesCount,
      featuredCoursesCount,
      averageEnrollmentsPerCourse,
      topCategories: categoryStats,
      topInstructors,
      monthlyGrowth: {
        users: monthlyUsers,
        courses: monthlyCourses,
        enrollments: monthlyEnrollments,
      },
    });
  } catch (error) {
    console.error('Failed to fetch detailed stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch detailed stats' },
      { status: 500 }
    );
  }
}