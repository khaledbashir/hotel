import { z } from "zod";

/**
 * Zod Schema for Hotel Contract Extraction
 * Enforces structured outputs from OpenAI and validates form data
 */

export const RoomRateSchema = z.object({
  roomType: z.string().min(1, "Room type is required"),
  season: z.enum(["Low", "Mid", "High", "Peak", "Year-round"]),
  rate: z.number().positive("Rate must be positive"),
  mealPlan: z.enum(["RO", "BB", "HB", "FB", "AI"], {
    description: "Room Only, Bed & Breakfast, Half Board, Full Board, All Inclusive",
  }),
  currency: z.string().default("USD"),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
});

export const HotelContractSchema = z.object({
  hotelName: z.string().min(1, "Hotel name is required"),
  contractStartDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid start date format",
  }),
  contractEndDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid end date format",
  }),
  currency: z.string().default("USD"),
  cancellationPolicy: z.string().optional(),
  paymentTerms: z.string().optional(),
  roomRates: z.array(RoomRateSchema).min(1, "At least one room rate is required"),
  // Additional metadata
  extractedAt: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

// Infer TypeScript types from Zod schemas
export type RoomRate = z.infer<typeof RoomRateSchema>;
export type HotelContract = z.infer<typeof HotelContractSchema>;

// Mock data for development
export const mockContractData: HotelContract = {
  hotelName: "Grand Sapphire Resort & Spa",
  contractStartDate: "2026-03-01",
  contractEndDate: "2027-02-28",
  currency: "EUR",
  cancellationPolicy: "Free cancellation up to 14 days before arrival. 50% charge for 7-14 days, 100% charge within 7 days.",
  paymentTerms: "Net 30 days from invoice date",
  roomRates: [
    {
      roomType: "Superior Double",
      season: "Low",
      rate: 120,
      mealPlan: "BB",
      currency: "EUR",
      validFrom: "2026-11-01",
      validTo: "2027-03-31",
    },
    {
      roomType: "Superior Double",
      season: "High",
      rate: 195,
      mealPlan: "BB",
      currency: "EUR",
      validFrom: "2026-06-01",
      validTo: "2026-08-31",
    },
    {
      roomType: "Deluxe Suite",
      season: "Low",
      rate: 280,
      mealPlan: "HB",
      currency: "EUR",
      validFrom: "2026-11-01",
      validTo: "2027-03-31",
    },
    {
      roomType: "Deluxe Suite",
      season: "Peak",
      rate: 450,
      mealPlan: "HB",
      currency: "EUR",
      validFrom: "2026-12-20",
      validTo: "2027-01-10",
    },
    {
      roomType: "Presidential Suite",
      season: "Year-round",
      rate: 890,
      mealPlan: "AI",
      currency: "EUR",
    },
  ],
  extractedAt: new Date().toISOString(),
  confidence: 0.94,
};
