import MedicineIcon from "../assets/icons/ic_health.png";
import DermatologyIcon from "../assets/icons/ic_dermatology.png";
import SurgeryIcon from "../assets/icons/ic_surgery.png";
import GynecologyIcon from "../assets/icons/ic_gynecology.png";
import NeurologyIcon from "../assets/icons/ic_brain.png";
import GastroenterologyIcon from "../assets/icons/ic_stomach.png";

export const ROLES = { DOCTOR: "doctor", PATIENT: "patient" };

export const TIME_SLOTS = [
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "2:00 PM",
    "2:30 PM",
  ];

export const DEPARTMENTS = [
  {
    name: "General Medicine",
    icon: MedicineIcon,
  },
  {
    name: "General Surgery",
    icon: SurgeryIcon,
  },
  {
    name: "Dermatology",
    icon: DermatologyIcon,
  },
  {
    name: "Gynecology",
    icon: GynecologyIcon,
  },
  {
    name: "Neurology",
    icon: NeurologyIcon,
  },
  {
    name: "Gastroenterology",
    icon: GastroenterologyIcon,
  },
];
