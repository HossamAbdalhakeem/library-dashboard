export type AttendanceBranchRef = {
  id: string;
  name: string;
};

export type AttendanceLocationStatus = "VERIFIED" | "DENIED" | "UNAVAILABLE";

export type AttendanceLocation = {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  status: AttendanceLocationStatus;
};

export type AttendanceLocationInput = {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  signal?: "denied" | "unavailable" | "timeout";
};

export type AttendancePunch = {
  id: string;
  occurredAt: string;
  branch: AttendanceBranchRef;
  location: AttendanceLocation | null;
  photoUrl?: string;
};

export type AttendanceToday = {
  date: string;
  checkIn: AttendancePunch | null;
  checkOut: AttendancePunch | null;
};

export type AttendanceDay = {
  employee: { id: string; fullName: string };
  branch: AttendanceBranchRef;
  workDate: string;
  checkIn: AttendancePunch | null;
  checkOut: AttendancePunch | null;
};

export type AttendanceDayStatus = "all" | "open" | "complete";

export type AttendanceQuery = {
  page?: number;
  per_page?: number;
  date?: string;
  branchId?: string;
  employeeId?: string;
  status?: AttendanceDayStatus;
};
