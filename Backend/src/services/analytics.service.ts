import mongoose from 'mongoose';
import { Event } from '../models/Event.model';
import { Registration } from '../models/Registration.model';
import { User } from '../models/User.model';
import { AuthUser, Role } from '../types';

export class AnalyticsService {
  static async getDashboardStats(user: AuthUser) {
    const isOrganizer = user.role === Role.ORGANIZER;
    const matchEvent = isOrganizer ? { organizer: new mongoose.Types.ObjectId(user._id), isDeleted: false } : { isDeleted: false };

    // Total Events
    const totalEvents = await Event.countDocuments(matchEvent);

    // Total Students
    const totalStudents = await User.countDocuments({ role: Role.STUDENT });

    // Today's Registrations
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayRegMatch = isOrganizer ? {
      registeredAt: { $gte: startOfToday, $lte: endOfToday },
    } : {
      registeredAt: { $gte: startOfToday, $lte: endOfToday },
    };

    // If organizer, only count registrations for their events
    let todayRegistrations = 0;
    if (isOrganizer) {
      const orgEvents = await Event.find({ organizer: user._id, isDeleted: false }).select('_id');
      const orgEventIds = orgEvents.map(e => e._id);
      todayRegistrations = await Registration.countDocuments({
        event: { $in: orgEventIds },
        registeredAt: { $gte: startOfToday, $lte: endOfToday }
      });
    } else {
      todayRegistrations = await Registration.countDocuments({
        registeredAt: { $gte: startOfToday, $lte: endOfToday }
      });
    }

    // Attendance Percentage (across all matched events)
    const attendanceStats = await Event.aggregate([
      { $match: matchEvent },
      {
        $group: {
          _id: null,
          totalRegistrations: { $sum: "$registrationCount" },
          totalCheckedIn: { $sum: "$checkedInCount" }
        }
      }
    ]);

    let attendancePercentage = 0;
    if (attendanceStats.length > 0 && attendanceStats[0].totalRegistrations > 0) {
      attendancePercentage = (attendanceStats[0].totalCheckedIn / attendanceStats[0].totalRegistrations) * 100;
    }

    // Top Events (by registration count)
    const topEvents = await Event.find(matchEvent)
      .sort({ registrationCount: -1 })
      .limit(5)
      .select('title registrationCount checkedInCount capacity date');

    // Upcoming Events
    const upcomingEvents = await Event.find({
      ...matchEvent,
      date: { $gte: new Date() },
      status: { $in: ['Upcoming', 'Ongoing'] },
    })
      .sort({ date: 1 })
      .limit(5)
      .select('title date venue capacity registrationCount checkedInCount bannerImage category status startTime description');

    const activeEvents = await Event.countDocuments({
      ...matchEvent,
      status: { $in: ['Upcoming', 'Ongoing'] },
    });

    const totalRegistrationsAgg = await Event.aggregate([
      { $match: matchEvent },
      { $group: { _id: null, total: { $sum: '$registrationCount' } } },
    ]);
    const totalRegistrations = totalRegistrationsAgg[0]?.total ?? 0;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    let thisWeekRegistrations = 0;
    if (isOrganizer) {
      const orgEvents = await Event.find({ organizer: user._id, isDeleted: false }).select('_id');
      const orgEventIds = orgEvents.map((e) => e._id);
      thisWeekRegistrations = await Registration.countDocuments({
        event: { $in: orgEventIds },
        registeredAt: { $gte: weekAgo },
      });
    } else {
      thisWeekRegistrations = await Registration.countDocuments({
        registeredAt: { $gte: weekAgo },
      });
    }

    let recentActivity: any[] = [];
    if (isOrganizer) {
      const orgEvents = await Event.find({ organizer: user._id, isDeleted: false }).select('_id title');
      const orgEventIds = orgEvents.map((e) => e._id);
      const eventTitleMap = Object.fromEntries(orgEvents.map((e) => [e._id.toString(), e.title]));
      const recentRegs = await Registration.find({ event: { $in: orgEventIds } })
        .sort({ registeredAt: -1 })
        .limit(8)
        .populate('user', 'name');
      recentActivity = recentRegs.map((r: any) => ({
        id: r._id.toString(),
        type: 'registration',
        message: `${r.user?.name || 'Student'} registered for ${eventTitleMap[r.event.toString()] || 'an event'}`,
        timestamp: r.registeredAt,
        eventId: r.event.toString(),
        eventTitle: eventTitleMap[r.event.toString()],
      }));
    }

    // Monthly Registrations (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const matchRegForMonthly = isOrganizer ? {
      createdAt: { $gte: sixMonthsAgo }
      // In a real scenario, we'd do a lookup to filter by organizer's events. 
      // For simplicity, fetching all or filtering manually if needed.
    } : {
      createdAt: { $gte: sixMonthsAgo }
    };

    let monthlyRegistrations = [];
    if (isOrganizer) {
      const orgEvents = await Event.find({ organizer: user._id, isDeleted: false }).select('_id');
      const orgEventIds = orgEvents.map(e => e._id);
      monthlyRegistrations = await Registration.aggregate([
        { $match: { event: { $in: orgEventIds }, createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]);
    } else {
      monthlyRegistrations = await Registration.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]);
    }

    return {
      totalEvents,
      totalStudents,
      todayRegistrations,
      activeEvents,
      totalRegistrations,
      thisWeekRegistrations,
      attendancePercentage: Math.round(attendancePercentage),
      topEvents,
      upcomingEvents,
      monthlyRegistrations,
      recentActivity,
    };
  }

  static async getAnalyticsData(user: AuthUser) {
    const isOrganizer = user.role === Role.ORGANIZER;
    const matchEvent = isOrganizer ? { organizer: new mongoose.Types.ObjectId(user._id), isDeleted: false } : { isDeleted: false };

    const totalEvents = await Event.countDocuments(matchEvent);
    const totalRegistrations = isOrganizer
      ? await Registration.countDocuments({ event: { $in: (await Event.find(matchEvent).select('_id')).map(e => e._id) } })
      : await Registration.countDocuments();

    const attendanceStats = await Event.aggregate([
      { $match: matchEvent },
      {
        $group: {
          _id: null,
          totalAttendees: { $sum: "$checkedInCount" }
        }
      }
    ]);
    const totalAttendees = attendanceStats.length > 0 ? attendanceStats[0].totalAttendees : 0;

    const attendanceRate = totalRegistrations > 0 ? Math.round((totalAttendees / totalRegistrations) * 100) : 0;

    // Last 7 days registrations
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let dailyRegs;
    if (isOrganizer) {
      const orgEvents = await Event.find(matchEvent).select('_id');
      const orgEventIds = orgEvents.map(e => e._id);
      dailyRegs = await Registration.aggregate([
        { $match: { event: { $in: orgEventIds }, createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: { $dayOfWeek: "$createdAt" }, count: { $sum: 1 } } }
      ]);
    } else {
      dailyRegs = await Registration.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: { $dayOfWeek: "$createdAt" }, count: { $sum: 1 } } }
      ]);
    }

    const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const registrationsOverTime = daysMap.map((day, i) => {
      const d = dailyRegs.find(dr => dr._id === i + 1);
      return { date: day, count: d ? d.count : 0 };
    });

    // Events by Category
    const categoryStats = await Event.aggregate([
      { $match: matchEvent },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    const eventsByCategory = categoryStats.map(c => ({ category: c._id || 'OTHER', count: c.count }));

    // Top Events
    const topEventsQuery = await Event.find(matchEvent)
      .sort({ registrationCount: -1 })
      .limit(5)
      .select('_id title registrationCount');

    const topEvents = topEventsQuery.map(e => ({
      eventId: e._id.toString(),
      title: e.title,
      registrations: e.registrationCount
    }));

    return {
      totalEvents,
      totalRegistrations,
      totalAttendees,
      totalRevenue: 0,
      attendanceRate,
      growthRate: 15,
      registrationsOverTime,
      eventsByCategory,
      topEvents
    };
  }
}
