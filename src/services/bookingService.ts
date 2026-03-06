import {
  addDocument,
  queryCollection,
  updateDocument,
  incrementField,
  getCollection,
} from "@/firebase/firestore";

export interface Booking {
  id: string;
  userId: string;
  trainId: string;
  trainNumber: string;
  trainName?: string;
  passengerName: string;
  age: number;
  gender: string;
  coach: string;
  seatNumber: number;
  travelDate: string; // ISO format: YYYY-MM-DD
  PNR: string;
  bookingStatus: string;
  createdAt: any;
}

const generatePNR = () => {
  const chars = "0123456789";
  let pnr = "";
  for (let i = 0; i < 10; i++) pnr += chars[Math.floor(Math.random() * chars.length)];
  return pnr;
};

const generateSeat = () => {
  const coaches = ["S1", "S2", "S3", "A1", "A2", "B1", "B2"];
  const coach = coaches[Math.floor(Math.random() * coaches.length)];
  const seat = Math.floor(Math.random() * 72) + 1;
  return { coach, seatNumber: seat };
};

export const createBooking = async (
  userId: string,
  trainId: string,
  trainNumber: string,
  trainName: string,
  passengerName: string,
  age: number,
  gender: string,
  travelDate: string, // ISO format: YYYY-MM-DD
  amount: number
) => {
  const { coach, seatNumber } = generateSeat();
  const PNR = generatePNR();

  // Validate and update schedule
  const schedules = await getCollection("trainSchedules") as any[];
  const schedule = schedules.find(s => s.trainId === trainId && s.date === travelDate);
  
  if (!schedule || schedule.seatsAvailable <= 0) {
    throw new Error("No seats available for this date");
  }

  const bookingDoc = await addDocument("bookings", {
    userId,
    trainId,
    trainNumber,
    trainName,
    passengerName,
    age,
    gender,
    coach,
    seatNumber,
    travelDate,
    PNR,
    bookingStatus: "confirmed",
    createdAt: new Date().toISOString(),
  });

  await addDocument("payments", {
    bookingId: bookingDoc.id,
    userId,
    amount,
    paymentMethod: "card",
    paymentStatus: "success",
    transactionId: `TXN${Date.now()}`,
    paymentDate: new Date().toISOString(),
  });

  // Update seats in schedule
  await updateDocument("trainSchedules", schedule.id, {
    seatsAvailable: schedule.seatsAvailable - 1,
  });

  // Also update the train's seatsAvailable for backward compatibility
  await incrementField("trains", trainId, "seatsAvailable", -1);

  return { bookingId: bookingDoc.id, PNR, coach, seatNumber };
};

export const getUserBookings = (userId: string) =>
  queryCollection("bookings", "userId", "==", userId) as Promise<Booking[]>;

export const getAllBookings = () => getCollection("bookings") as Promise<Booking[]>;

export const cancelBooking = async (bookingId: string, trainId: string) => {
  await updateDocument("bookings", bookingId, { bookingStatus: "cancelled" });
  await incrementField("trains", trainId, "seatsAvailable", 1);
};

export const getBookingByPNR = async (pnr: string) => {
  const results = await queryCollection("bookings", "PNR", "==", pnr);
  return results.length > 0 ? (results[0] as Booking) : null;
};
