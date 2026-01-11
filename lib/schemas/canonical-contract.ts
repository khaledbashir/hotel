/**
 * Canonical Contract JSON Schema (v1.0.0)
 * 
 * Purpose: Single, standardized JSON structure for all hotel contracts
 * Designed for: Database insertion, API responses, frontend consumption
 * 
 * Versioning: 
 * - v1.0.0: Initial comprehensive schema
 * - Future versions: Add new fields without breaking changes
 */

export interface CanonicalContract {
  // =========================================================================
  // METADATA: Core contract identification
  // =========================================================================
  meta: {
    hotelName: string;
    location?: string;
    country?: string;
    city?: string;
    language: LanguageCode;
    currency: string;
    contractId?: string;
    schemaVersion: string; // "v1.0.0"
    extractedAt: string; // ISO 8601
  };

  // =========================================================================
  // EFFECTIVE PERIOD: When this contract applies
  // =========================================================================
  effectivePeriod: {
    from: string; // YYYY-MM-DD
    to: string; // YYYY-MM-DD
    signingDate?: string;
    renewalDate?: string;
  };

  // =========================================================================
  // RATES: Room pricing with full dimensionality
  // =========================================================================
  rates: Rate[];

  // =========================================================================
  // ALLOTMENTS: Guaranteed room blocks
  // =========================================================================
  allotments?: Allotment[];

  // =========================================================================
  // BLACKOUT DATES: Periods when bookings not allowed
  // =========================================================================
  blackoutDates?: BlackoutDate[];

  // =========================================================================
  // COMMISSIONS: Agent/tour operator commissions
  // =========================================================================
  commissions?: Commission[];

  // =========================================================================
  // CHARGES: Mandatory and optional fees
  // =========================================================================
  charges?: Charge[];

  // =========================================================================
  // CANCELLATIONS: Penalty structures
  // =========================================================================
  cancellations?: CancellationPolicy[];

  // =========================================================================
  // PAYMENT TERMS: Financial settlement
  // =========================================================================
  payment?: PaymentTerms;

  // =========================================================================
  // RESTRICTIONS: Booking constraints
  // =========================================================================
  restrictions?: Restrictions;

  // =========================================================================
  // CLAUSES: Raw contract text for reference
  // =========================================================================
  rawClauses?: RawClause[];

  // =========================================================================
  // UNCERTAIN FIELDS: Low-confidence extractions
  // =========================================================================
  uncertainFields?: UncertainField[];

  // =========================================================================
  // EXTRAS: Hotel-specific extensions (future-proofing)
  // =========================================================================
  extras?: Record<string, unknown>;
}

// ============================================================================
// RATE: Complete room rate definition
// ============================================================================

export interface Rate {
  // Room identification (normalized + raw)
  roomTypeCode: RoomTypeCode;
  roomTypeRaw?: string; // Keep original for debugging

  // Seasonality
  season: Season;
  dateRange?: {
    from: string; // YYYY-MM-DD
    to: string; // YYYY-MM-DD
  };

  // Pricing
  price: number;
  priceType: PriceType;
  currency: string;

  // Occupancy
  occupancy?: number;
  maxOccupancy?: number;

  // Meal plan (normalized + raw)
  mealPlan: MealPlanCode;
  mealPlanRaw?: string;

  // Validity
  validFrom?: string;
  validTo?: string;
  minStay?: number;
  maxStay?: number;

  // Allotment for this rate
  allotment?: number;
  releaseDays?: number;

  // Quality
  confidence?: number; // 0-1
  notes?: string;

  // Extensions
  extras?: Record<string, unknown>;
}

// ============================================================================
// ALLOTMENT: Guaranteed room blocks
// ============================================================================

export interface Allotment {
  roomTypeCode: RoomTypeCode;
  roomTypeRaw?: string;

  season: Season;
  dateRange?: {
    from: string;
    to: string;
  };

  allotment: number;
  releaseDays?: number;

  minStay?: number;
  maxStay?: number;

  confidence?: number;
  notes?: string;
  extras?: Record<string, unknown>;
}

// ============================================================================
// BLACKOUT DATE: Non-booking periods
// ============================================================================

export interface BlackoutDate {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  reason?: string;
  appliesToRoomTypes?: RoomTypeCode[];
  appliesToSeasons?: Season[];
  note?: string;
}

// ============================================================================
// COMMISSION: Agent/tour operator fees
// ============================================================================

export interface Commission {
  type: CommissionType;
  value: number;
  appliesTo: 'TOTAL' | 'ROOM_RATE' | 'NET_RATE' | 'CUSTOM';
  currency?: string;
  paymentFrequency?: 'MONTHLY' | 'QUARTERLY' | 'UPON_BOOKING' | 'UPON_PAYMENT';
  description?: string;
}

// ============================================================================
// CHARGE: Mandatory and optional fees
// ============================================================================

export interface Charge {
  name: string;
  type: ChargeType;
  value: number;
  currency?: string;
  perPerson?: boolean;
  perNight?: boolean;
  perStay?: boolean;
  percentage?: boolean;
  mandatory: boolean;
  appliesToRoomTypes?: RoomTypeCode[];
  appliesToSeasons?: Season[];
  description?: string;
}

// ============================================================================
// CANCELLATION POLICY: Penalty structure
// ============================================================================

export interface CancellationPolicy {
  daysBefore?: number; // Days before arrival
  penaltyType: CancellationPenaltyType;
  penaltyValue?: number; // Nights, percent, or fixed amount
  penaltyCurrency?: string;
  appliesToRoomTypes?: RoomTypeCode[];
  appliesToSeasons?: Season[];
  noShowCharge?: number;
  earlyDepartureCharge?: number;
  freeCancellationHours?: number;
  description?: string;
}

// ============================================================================
// PAYMENT TERMS: Financial settlement
// ============================================================================

export interface PaymentTerms {
  terms: 'NET_DAYS' | 'PAYMENT_ON_ARRIVAL' | 'DEPOSIT_REQUIRED' | 'PRE_PAYMENT';
  paymentDays?: number;
  depositRequired?: number;
  depositPercentage?: number;
  depositDeadlineDays?: number;
  paymentMethods?: PaymentMethod[];
  currency?: string;
  notes?: string;
}

// ============================================================================
// RESTRICTIONS: Booking constraints
// ============================================================================

export interface Restrictions {
  minStayNights?: number;
  maxStayNights?: number;
  checkInTime?: string; // HH:MM
  checkOutTime?: string; // HH:MM
  childrenAllowed?: boolean;
  childrenMaxAge?: number;
  childrenAloneAllowed?: boolean;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  creditCardRequired?: boolean;
  notes?: string;
}

// ============================================================================
// RAW CLAUSE: Free-form contract text
// ============================================================================

export interface RawClause {
  label: string; // e.g., "earlyCheckin", "lateCheckout", "paymentTerms"
  category?: string; // commercial, legal, operational, cancellation
  text: string;
  pageNumber?: number;
  extractedData?: Record<string, unknown>;
  importance?: number; // 0-1 for prioritization
  tags?: string[];
}

// ============================================================================
// UNCERTAIN FIELD: Low-confidence extractions
// ============================================================================

export interface UncertainField {
  path: string; // e.g., "rates.0.price", "allotments.1.releaseDays"
  reason: string; // Why uncertain
  confidence: number; // 0-1
  alternatives?: Array<{
    value: unknown;
    confidence: number;
  }>;
  contextText?: string; // Surrounding text for manual review
  pageNumber?: number;
  suggestedValue?: unknown;
}

// ============================================================================
// ENUMS: Normalized values
// ============================================================================

export type LanguageCode = 
  | 'EN'  // English
  | 'ES'  // Spanish
  | 'FR'  // French
  | 'DE'  // German
  | 'IT'  // Italian
  | 'PT'  // Portuguese
  | 'RU'  // Russian
  | 'ZH'  // Chinese
  | 'JA'  // Japanese
  | 'AR'  // Arabic
  | 'OTHER';

export type Season = 
  | 'Low'
  | 'Mid'
  | 'High'
  | 'Peak'
  | 'Year_round'
  | 'Christmas'
  | 'Easter'
  | 'Shoulder'
  | 'Custom';

export type RoomTypeCode = 
  | 'SINGLE'
  | 'DOUBLE'
  | 'TWIN'
  | 'TRIPLE'
  | 'SUITE'
  | 'APARTMENT'
  | 'VILLA'
  | 'OTHER';

export type PriceType = 
  | 'PER_ROOM'
  | 'PER_PERSON'
  | 'PER_NIGHT'
  | 'PER_STAY'
  | 'CUSTOM';

export type MealPlanCode = 
  | 'RO'  // Room Only
  | 'BB'  // Bed & Breakfast
  | 'HB'  // Half Board
  | 'FB'  // Full Board
  | 'AI'  // All Inclusive
  | 'CUSTOM';

export type CommissionType = 
  | 'PERCENT'
  | 'FIXED'
  | 'PER_PERSON'
  | 'PER_NIGHT'
  | 'CUSTOM';

export type ChargeType = 
  | 'PER_PERSON_PER_NIGHT'
  | 'PER_ROOM_PER_NIGHT'
  | 'PER_STAY'
  | 'PERCENTAGE'
  | 'FIXED'
  | 'CUSTOM';

export type CancellationPenaltyType = 
  | 'NIGHTS'
  | 'PERCENTAGE'
  | 'FIXED'
  | 'NO_SHOW'
  | 'CUSTOM';

export type PaymentMethod = 
  | 'BANK_TRANSFER'
  | 'CREDIT_CARD'
  | 'CHEQUE'
  | 'CASH'
  | 'DIRECT_DEBIT';

// ============================================================================
// EXAMPLE: Real-world contract sample
// ============================================================================

export const EXAMPLE_CANONICAL_CONTRACT: CanonicalContract = {
  meta: {
    hotelName: "Grand Sapphire Resort & Spa",
    location: "Santorini, Greece",
    country: "Greece",
    city: "Santorini",
    language: "EN",
    currency: "EUR",
    schemaVersion: "v1.0.0",
    extractedAt: new Date().toISOString(),
  },
  effectivePeriod: {
    from: "2026-03-01",
    to: "2027-02-28",
    signingDate: "2026-01-15",
  },
  rates: [
    {
      roomTypeCode: "DOUBLE",
      roomTypeRaw: "Superior Double Room",
      season: "High",
      dateRange: {
        from: "2026-06-01",
        to: "2026-08-31",
      },
      price: 195,
      priceType: "PER_ROOM",
      currency: "EUR",
      occupancy: 2,
      maxOccupancy: 3,
      mealPlan: "BB",
      mealPlanRaw: "Bed & Breakfast",
      validFrom: "2026-06-01",
      validTo: "2026-08-31",
      minStay: 2,
      maxStay: 14,
      allotment: 10,
      releaseDays: 7,
      confidence: 0.95,
    },
    {
      roomTypeCode: "SUITE",
      roomTypeRaw: "Deluxe Suite",
      season: "Year_round",
      price: 350,
      priceType: "PER_ROOM",
      currency: "EUR",
      occupancy: 2,
      maxOccupancy: 4,
      mealPlan: "HB",
      mealPlanRaw: "Half Board",
      confidence: 0.92,
    },
  ],
  allotments: [
    {
      roomTypeCode: "DOUBLE",
      season: "High",
      allotment: 15,
      releaseDays: 14,
      minStay: 3,
      confidence: 0.88,
    },
  ],
  blackoutDates: [
    {
      from: "2026-12-20",
      to: "2027-01-10",
      reason: "Christmas/New Year",
      note: "All room types affected",
    },
  ],
  commissions: [
    {
      type: "PERCENT",
      value: 15,
      appliesTo: "TOTAL",
      currency: "EUR",
      paymentFrequency: "UPON_PAYMENT",
      description: "Standard agency commission",
    },
  ],
  charges: [
    {
      name: "City tax",
      type: "PER_PERSON_PER_NIGHT",
      value: 3,
      currency: "EUR",
      perPerson: true,
      perNight: true,
      mandatory: true,
      description: "Municipal tax, collected at hotel",
    },
    {
      name: "Service charge",
      type: "PERCENTAGE",
      value: 10,
      mandatory: true,
      description: "Included in published rates",
    },
  ],
  cancellations: [
    {
      daysBefore: 14,
      penaltyType: "FIXED",
      penaltyValue: 0,
      description: "Free cancellation",
    },
    {
      daysBefore: 7,
      penaltyType: "NIGHTS",
      penaltyValue: 1,
      description: "1 night charge",
    },
    {
      daysBefore: 0,
      penaltyType: "NIGHTS",
      penaltyValue: 2,
      penaltyCurrency: "EUR",
      noShowCharge: 2,
      description: "No-show or late cancellation",
    },
    {
      freeCancellationHours: 24,
      penaltyType: "NIGHTS",
      penaltyValue: 0,
      description: "24-hour free cancellation window",
    },
  ],
  payment: {
    terms: "NET_DAYS",
    paymentDays: 30,
    depositRequired: 100,
    depositPercentage: 20,
    depositDeadlineDays: 14,
    paymentMethods: ["BANK_TRANSFER", "CREDIT_CARD"],
    currency: "EUR",
    notes: "Deposit non-refundable if cancelled within 7 days",
  },
  restrictions: {
    minStayNights: 2,
    maxStayNights: 14,
    checkInTime: "15:00",
    checkOutTime: "11:00",
    childrenAllowed: true,
    childrenMaxAge: 12,
    childrenAloneAllowed: false,
    petsAllowed: false,
    smokingAllowed: false,
    creditCardRequired: true,
  },
  rawClauses: [
    {
      label: "earlyCheckin",
      category: "operational",
      text: "Early check-in is subject to availability and may incur an additional charge of 50% of the nightly rate.",
      pageNumber: 2,
      importance: 0.6,
      tags: ["checkin", "fees"],
    },
    {
      label: "lateCheckout",
      category: "operational",
      text: "Late check-out after 11:00 will be charged as half-day.",
      pageNumber: 2,
      importance: 0.7,
      tags: ["checkout", "fees"],
    },
  ],
  uncertainFields: [
    {
      path: "rates.0.releaseDays",
      reason: "Conflicting values found: 7 days in rate table, 14 days in allotment section",
      confidence: 0.45,
      alternatives: [
        { value: 7, confidence: 0.6 },
        { value: 14, confidence: 0.4 },
      ],
      contextText: "Release period: 7 days (Table 3), 14 days (Section 5.2)",
      pageNumber: 3,
      suggestedValue: 14,
    },
  ],
};
