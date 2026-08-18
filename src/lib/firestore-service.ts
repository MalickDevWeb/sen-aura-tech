import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy, 
  limit 
} from "firebase/firestore";
import { db } from "./firebase";
import { QuoteRequestDTO, BookingDTO, OrderDTO, TicketDTO } from "../shared/contracts/types";

// Collection names
export const COLLECTIONS = {
  QUOTES: "quotes",
  BOOKINGS: "bookings",
  ORDERS: "orders",
  TICKETS: "tickets",
  PARTNERS: "partner_applications"
};

// Save a new quote to Firestore
export async function saveQuoteToFirestore(quote: QuoteRequestDTO): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.QUOTES, quote.id);
    await setDoc(docRef, { ...quote });
  } catch (error) {
    console.warn("Firestore quote save warning (using local fallback):", error);
  }
}

// Subscribe to real-time quotes updates
export function subscribeQuotesFromFirestore(callback: (quotes: QuoteRequestDTO[]) => void): () => void {
  try {
    const q = query(collection(db, COLLECTIONS.QUOTES), limit(50));
    return onSnapshot(q, (snapshot) => {
      const quotesList: QuoteRequestDTO[] = [];
      snapshot.forEach((docSnap) => {
        quotesList.push(docSnap.data() as QuoteRequestDTO);
      });
      if (quotesList.length > 0) {
        callback(quotesList);
      }
    }, (error) => {
      console.warn("Firestore quotes subscription notice:", error);
    });
  } catch (err) {
    console.warn("Firestore quotes error:", err);
    return () => {};
  }
}

// Save a new booking to Firestore
export async function saveBookingToFirestore(booking: BookingDTO): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.BOOKINGS, booking.id);
    await setDoc(docRef, { ...booking });
  } catch (error) {
    console.warn("Firestore booking save warning:", error);
  }
}

// Subscribe to real-time bookings updates
export function subscribeBookingsFromFirestore(callback: (bookings: BookingDTO[]) => void): () => void {
  try {
    const q = query(collection(db, COLLECTIONS.BOOKINGS), limit(50));
    return onSnapshot(q, (snapshot) => {
      const bookingsList: BookingDTO[] = [];
      snapshot.forEach((docSnap) => {
        bookingsList.push(docSnap.data() as BookingDTO);
      });
      if (bookingsList.length > 0) {
        callback(bookingsList);
      }
    }, (error) => {
      console.warn("Firestore bookings subscription notice:", error);
    });
  } catch (err) {
    console.warn("Firestore bookings error:", err);
    return () => {};
  }
}

// Save a new order to Firestore
export async function saveOrderToFirestore(order: OrderDTO): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.ORDERS, order.id);
    await setDoc(docRef, { ...order });
  } catch (error) {
    console.warn("Firestore order save warning:", error);
  }
}

// Subscribe to real-time orders updates
export function subscribeOrdersFromFirestore(callback: (orders: OrderDTO[]) => void): () => void {
  try {
    const q = query(collection(db, COLLECTIONS.ORDERS), limit(50));
    return onSnapshot(q, (snapshot) => {
      const ordersList: OrderDTO[] = [];
      snapshot.forEach((docSnap) => {
        ordersList.push(docSnap.data() as OrderDTO);
      });
      if (ordersList.length > 0) {
        callback(ordersList);
      }
    }, (error) => {
      console.warn("Firestore orders subscription notice:", error);
    });
  } catch (err) {
    console.warn("Firestore orders error:", err);
    return () => {};
  }
}

// Save a ticket to Firestore
export async function saveTicketToFirestore(ticket: TicketDTO): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.TICKETS, ticket.id);
    await setDoc(docRef, { ...ticket });
  } catch (error) {
    console.warn("Firestore ticket save warning:", error);
  }
}

// Save partner application to Firestore
export async function savePartnerApplicationToFirestore(data: {
  fullName: string;
  email: string;
  phone: string;
  profileType: string;
  city: string;
  notes?: string;
}): Promise<void> {
  try {
    const id = `PARTNER-${Date.now()}`;
    const docRef = doc(db, COLLECTIONS.PARTNERS, id);
    await setDoc(docRef, {
      ...data,
      id,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.warn("Firestore partner application save warning:", error);
  }
}
