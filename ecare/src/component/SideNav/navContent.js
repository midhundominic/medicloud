import DashboardCustomizeRoundedIcon from "@mui/icons-material/DashboardCustomizeRounded";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PaymentIcon from "@mui/icons-material/Payment";
import VideoChatIcon from "@mui/icons-material/VideoChat";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import ReviewsIcon from '@mui/icons-material/Reviews';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import MedicationIcon from '@mui/icons-material/Medication';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';

import { ROUTES } from "../../router/routes";

export const NAV_CONTENT_PATIENT = [
  {
    id: 1,
    title: "Dashboard",
    link: ROUTES.PATIENT_HOME,
    icon: DashboardCustomizeRoundedIcon,
  },
  {
    id: 2,
    title: "Appointments",
    link: ROUTES.PATIENT_APPOINTMENT,
    icon: CalendarMonthIcon,
  },
  // {
  //   id: 3,
  //   title: "Consultation",
  //   link: ROUTES.PATIENT_CONSULTATION,
  //   icon: VideoChatIcon,
  // },
  {
    id: 4,
    title: "Bookings",
    link: ROUTES.SCHEDULED_APPOINTMENT,
    icon: EditCalendarIcon,
  },
  {
    id: 5,
    title: "Completed Appointments",
    link: ROUTES.COMPLETED_APPOINTMENT,
    icon: PaymentIcon,
  },
  {
    id: 6,
    title: "Records",
    link: ROUTES.PATIENT_RECORDS,
    icon: LibraryBooksIcon,
  },
  {
    id: 7,
    title: "Payments",
    link: ROUTES.PATIENT_PAYMENTS,
    icon: PaymentIcon,
  },
  {
    id: 8,
    title: "Chat Bot",
    link: ROUTES.CHATBOT,
    icon: ChatBubbleIcon,
  },
  {
    id: 9,
    title: "Health Assistant",
    link: ROUTES.VIRTUALHEALTHASSISTANT,
    icon: MedicationIcon,
  },
  {
  id: 10,
  title: "Chatbot",
  link: ROUTES.GEMINI_CHATBOT,
  icon: ChatBubbleIcon,
 },
 {
  id: 11,
  title: "Prescripion Analyzer",
  link: ROUTES.PRESCRIPTION_ANALYZER,
  icon: ImageSearchIcon,

 },
 {
  id: 12,
  title: "Disease Prediction",
  link: ROUTES.DISEASE_PREDICTION,
  icon: AnalyticsIcon,
 }

];

export const NAV_CONTENT_ADMIN = [
  {
    id: 1,
    title: "Dashboard",
    link: ROUTES.ADMIN_HOME,
    icon: DashboardCustomizeRoundedIcon,
  },
  {
    id: 2,
    title: "Doctors",
    link: ROUTES.ADMIN_DOC_LIST,
    icon: BadgeRoundedIcon,
  },
  {
    id: 3,
    title: "Patients",
    link: ROUTES.ADMIN_PATIENT_LIST,
    icon: PeopleRoundedIcon,
  },
  {
    id: 4,
    title: "Pharmacy",
    link: ROUTES.ADMIN_COORDINATOR_LIST,
    icon: PeopleRoundedIcon,
  },
  {
    id: 5,
    title: "Laboratory",
    link: ROUTES.LABORATORY_LIST,
    icon: PeopleRoundedIcon,
  },
  {
    id: 6,
    title: "Appointments",
    link: ROUTES.ADMIN_APPOINTMENTS,
    icon: CalendarMonthIcon,
  },
  {
    id: 7,
    title: "Leave",
    link: ROUTES.ADMIN_LEAVE,
    icon: EditCalendarIcon,
  },
  {
    id: 8,
    title: "Reviews",
    link: ROUTES.ADMIN_REVIEW,
    icon: ReviewsIcon,
  },
  {
    id: 9,
    title: "Laboratory Test",
    link: ROUTES.ADMIN_LABTEST_LIST,
    icon: PeopleRoundedIcon
  }
];

export const NAV_CONTENT_DOCTOR = [
  {
    id: 1,
    title: "Dashboard",
    link: ROUTES.DOCTOR_HOME,
    icon: DashboardCustomizeRoundedIcon,
  },
  {
    id: 2,
    title: "Appointments",
    link: ROUTES.SCHEDULED_APPOINTMENTS,
    icon: CalendarMonthIcon,
  },
  {
    id: 3,
    title: "Patients",
    link: ROUTES.DOCTOR_PATIENTLIST,
    icon: PeopleRoundedIcon,
  },
  {
    id: 4,
    title: "Leave Appilication",
    link: ROUTES.DOCTOR_LEAVE,
    icon: EditCalendarIcon,
  },
];

export const NAV_CONTENT_COORDINATOR = [
  {
    id: 1,
    title: "Dashboard",
    link: ROUTES.COORDINATOR_HOME,
    icon: DashboardCustomizeRoundedIcon,
  },

  {
    id: 2,
    title: "Records",
    link: ROUTES.HEALTH_RECORDS,
    icon: AutoStoriesIcon,
  },

  {
    id: 3,
    title: "Test Results",
    link: ROUTES.TEST_RESULTS,
    icon: AutoStoriesIcon,
  },

  {
    id: 4,
    title: "Completed Results",
    link: ROUTES.COMPLETED_RESULT,
    icon: AutoStoriesIcon,
  },
  {
    id: 5,
    title: "Medicine",
    link: ROUTES.MEDICINE_LIST,
    icon: AutoStoriesIcon,
  },
];

export const NAV_CONTENT_LABORATORY =[
  {
    id: 1,
    title: "Dashboard",
    link: ROUTES.LABORATORY_HOME,
    icon:DashboardCustomizeRoundedIcon
  },
  {
    id: 2,
    title: "Pending Tests",
    link: ROUTES.LABORATORY_PENDING,
    icon: LibraryBooksIcon
  },
  {
    id: 3,
    title: "Result",
    link: ROUTES.LABORATORY_RESULT,
    icon: AutoStoriesIcon
  },
  
];
