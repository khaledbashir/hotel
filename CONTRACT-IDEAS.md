# 🧠 Contract AI: Creative Ideas & Roadmap

## 🎯 Current Pain Points
- Hotel name often shows as "Unknown Hotel" ✅ **FIXED**: AI now hunts for it aggressively
- Static form doesn't adapt to contract type
- Chat was floating weirdly ✅ **FIXED**: Now sleek slide-out panel
- Limited structured data fields

---

## 🚀 DYNAMIC FORM CONCEPTS

### 1️⃣ **Contract Type Detection + Smart Layout**
**Idea**: Detect contract type and generate appropriate fields dynamically

```typescript
// Auto-detect contract structure
const contractType = detectContractType(extractedText);

switch(contractType) {
  case 'RATES_ONLY':
    // Show: Room rates table, seasonal pricing, meal plans
    // Hide: Cancellation, Payment terms
  case 'FULL_CONTRACT':
    // Show: Everything (current form)
  case 'GROUP_BOOKING':
    // Show: Group size, blocks, blackout dates
  case 'CORPORATE_RATES':
    // Show: Company info, negotiated rates, duration
  case 'INCENTIVE':
    // Show: Event space, F&B minimums, meeting room rates
}
```

**Benefits**: Cleaner UI, less scrolling, focused on relevant fields

---

### 2️⃣ **Section-Based Progressive Disclosure**
**Idea**: Only show sections when user clicks "Expand"

```tsx
<div className="space-y-4">
  {/* Always Visible */}
  <HotelNameSection />

  {/* Expandable Sections */}
  <Accordion>
    <AccordionItem value="room-rates">
      <AccordionTrigger>🏨 Room Rates (12 found)</AccordionTrigger>
      <AccordionContent>
        <RoomRatesTable />
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="cancellation">
      <AccordionTrigger>❌ Cancellation Policy</AccordionTrigger>
      <AccordionContent>
        <CancellationPolicyEditor />
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</div>
```

---

### 3️⃣ **Smart Field Hierarchy**
**Idea**: Group related fields into collapsible cards

```tsx
<Card>
  <CardHeader>
    <CardTitle>
      <Badge>Primary</Badge> Hotel Information
    </CardTitle>
  </CardHeader>
  <CardContent>
    <HotelName />
    <ContractDates />
    <Currency />
  </CardContent>
</Card>

<Card>
  <CardHeader>
    <CardTitle>
      <Badge variant="secondary">12 Rooms</Badge> Room Rates Matrix
    </CardTitle>
  </CardHeader>
  <CardContent>
    <SeasonalPricingMatrix />
  </CardContent>
</Card>
```

---

## 📋 NEW DATA FIELDS TO SUPPORT

### **Property Details** (New Section)
```typescript
{
  propertyType: "hotel" | "resort" | "apartment" | "villa",
  starRating: 1 | 2 | 3 | 4 | 5,
  totalRooms: number,
  chainAffiliation: "Marriott" | "Hilton" | "IHG" | "Accor" | "Independent",
  location: {
    address: string,
    city: string,
    country: string,
    coordinates?: { lat, lng }
  },
  amenities: string[], // ["Pool", "Spa", "Gym", "Restaurant"]
}
```

---

### **Seasonal Pricing Matrix** (Enhanced)
```typescript
{
  seasonalRates: [
    {
      season: "Year_round" | "Low" | "Mid" | "High" | "Peak",
      period: { from: "2026-01-01", to: "2026-12-31" },
      rates: {
        single: 120,
        double: 150,
        triple: 180,
        suite: 250
      },
      mealPlans: {
        RO: 100,
        BB: 120,
        HB: 145,
        FB: 180,
        AI: 220
      },
      supplements: {
        extraBed: 30,
        childBed: 0,
        halfBoard: 25,
        fullBoard: 60
      }
    }
  ]
}
```

---

### **Blackout Dates & Restrictions**
```typescript
{
  blackoutDates: [
    {
      from: "2026-12-24",
      to: "2026-12-26",
      reason: "Christmas",
      rateMultiplier: 2.0 // 200% of normal rate
    },
    {
      from: "2026-07-01",
      to: "2026-08-31",
      reason: "High Season",
      minimumStay: 7,
      deposit: "50%"
    }
  ],
  bookingRestrictions: {
    minimumStay: 3,
    maximumStay: 21,
    advanceBooking: 30, // days
    checkInDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    checkOutDays: ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  }
}
```

---

### **Corporate & Group Contracts**
```typescript
{
  companyDetails: {
    name: string,
    industry: "Technology" | "Finance" | "Pharma" | "Consulting",
    volumeTier: "Low" | "Medium" | "High" | "Enterprise",
    contractVolume: number, // room nights/year
    negotiatedDiscount: number // percentage
  },
  groupBlocks: [
    {
      groupName: "Q1 Kickoff",
      checkIn: "2026-02-15",
      checkOut: "2026-02-20",
      rooms: 25,
      rate: 135,
      mealPlan: "HB",
      fandbMinimum: 5000, // $ USD
      meetingRooms: ["Grand Ballroom", "Breakout A"]
    }
  ]
}
```

---

### **Event & Incentive Contracts**
```typescript
{
  eventDetails: {
    eventType: "Conference" | "Wedding" | "Incentive" | "Product Launch",
    expectedAttendees: number,
    duration: number, // days
    program: string // "3-day conference with gala dinner"
  },
  eventRates: {
    dayRate: 250,
    24hRate: 280,
    delegateRate: 220, // per person
    meetingRoomRate: 500 // per day
  },
  catering: {
    breakfast: 25,
    lunch: 35,
    dinner: 45,
    coffeeBreak: 10
  }
}
```

---

### **Commission & Payment Terms**
```typescript
{
  commission: {
    baseRate: 10, // percentage
    volumeBonus: "2% for >500 rooms/night",
    earlyPaymentBonus: "3% if paid within 7 days",
    netRates: true | false
  },
  paymentSchedule: [
    {
      milestone: "Deposit",
      amount: 30, // percentage
      dueDays: 14 // before arrival
    },
    {
      milestone: "Final Balance",
      amount: 70,
      dueDays: 14 // before arrival
    }
  ],
  paymentMethods: ["Credit Card", "Bank Transfer", "Check"],
  paymentCurrency: "EUR",
  invoicing: {
    billingCycle: "Monthly" | "Per Stay",
    netDays: 30
  }
}
```

---

### **Cancellation & Refund Policies** (Detailed)
```typescript
{
  cancellationTiers: [
    {
      daysBeforeArrival: 14,
      charge: 0, // percentage
      description: "Full refund"
    },
    {
      daysBeforeArrival: 7,
      charge: 50,
      description: "50% of total booking"
    },
    {
      daysBeforeArrival: 0,
      charge: 100,
      description: "Full charge (no show)"
    }
  ],
  noShowPolicy: "100% charge",
  forceMajeure: "Hotel not liable for natural disasters",
  refundMethod: "Original payment method"
}
```

---

### **Special Offers & Packages**
```typescript
{
  specialPackages: [
    {
      name: "Honeymoon Special",
      description: "Champagne + flowers + late checkout",
      price: 50, // supplement per night
      inclusions: ["Sparkling wine", "Rose petals", "Room upgrade if available"],
      validFrom: "2026-04-01",
      validTo: "2026-09-30",
      minNights: 3
    },
    {
      name: "Weekend Escape",
      description: "2 nights + 1 dinner",
      price: 200, // package price
      inclusions: ["2 nights accommodation", "1 3-course dinner for 2"],
      validity: ["Fri", "Sat"]
    }
  ]
}
```

---

## 🎨 UI/UX IMPROVEMENTS

### **Smart Form Builder**
```typescript
interface DynamicFieldConfig {
  id: string;
  type: 'text' | 'number' | 'date' | 'select' | 'table' | 'matrix';
  label: string;
  placeholder?: string;
  validation?: ValidationRule[];
  conditional?: {
    field: string;
    value: any;
    show: boolean;
  };
  aiExtracted?: boolean; // Show badge if AI found this
  confidence?: number; // 0-1, show confidence indicator
}

// Generate form based on contract type
const formFields = generateDynamicFields(contractType, extractedData);
```

---

### **Confidence Indicators**
```tsx
<div className="relative">
  <Label>Hotel Name</Label>
  <Input value={hotelName} />
  
  {/* Confidence Badge */}
  {aiExtracted && (
    <Badge className="absolute -top-2 -right-2 bg-green-500">
      {confidence * 100}% Match
    </Badge>
  )}
</div>
```

---

### **Auto-Fill Suggestions**
```tsx
<Input
  value={hotelName}
  onChange={(e) => setHotelName(e.target.value)}
  suggestions={[
    "Grand Sapphire Resort & Spa",
    "Sapphire Grand Hotel",
    "Grand Resort"
  ]}
  onSuggestionSelect={(val) => setHotelName(val)}
/>
```

---

### **Visual Data Preview**
```tsx
<RoomRatesVisualizer
  rates={roomRates}
  view="timeline" // | "table" | "heatmap"
  height={400}
  interactive
  onRateEdit={(rate) => openEditor(rate)}
/>
```

---

## 🤖 AI ENHANCEMENTS

### **Multi-Turn Extraction**
```typescript
// First pass: Get basic structure
const initialExtract = await extractContractBasic(document);

// Second pass: Ask clarifying questions
const clarifications = await askAIQuestions([
  "I see 3 room types. Are there any VIP/Suites?",
  "Does the breakfast rate include taxes?",
  "Are there any seasonal supplements?"
]);

// Third pass: Final data with confirmed details
const finalData = await refineExtract(initialExtract, clarifications);
```

---

### **Document Comparison**
```typescript
// Upload 2 contracts and compare
const comparison = await compareContracts(contractA, contractB);

{
  same: ["Hotel Name", "Currency"],
  different: {
    roomRates: [
      { room: "Deluxe", oldRate: 120, newRate: 135, change: "+12.5%" }
    ],
    cancellation: [
      { property: "Free cancellation days", old: 14, new: 7, change: "-7 days" }
    ]
  }
}
```

---

### **Contract Negotiation Assistant**
```typescript
const suggestions = await getNegotiationTips(contractData);

[
  "💡 Tip: Your current commission is 10%. Volume >500 nights qualifies for 12%.",
  "💡 Tip: Cancellation policy is stricter than market avg. Request 14-day window.",
  "💡 Tip: No blackout dates in Q4 - good for year-end events."
]
```

---

## 📊 EXPORT OPTIONS

```typescript
// Multiple export formats
const exportFormats = {
  pdf: generateContractPDF(contractData),
  excel: exportToExcel(contractData),
  csv: exportToCSV(roomRates),
  json: contractData,
  word: generateWordDoc(contractData),
  api: syncToPMS(contractData) // Push to Property Management System
};
```

---

## 🎯 PRIORITY ROADMAP

### **Phase 1: Immediate (This Week)**
✅ Fix hotel name extraction (done)
✅ Chat slide-out panel (done)
⬜ Better confidence indicators
⬜ Edit validation with error messages

### **Phase 2: Dynamic Forms (Next Week)**
⬜ Contract type detection
⬜ Progressive disclosure (accordion sections)
⬜ Smart field grouping
⬜ Visual rate matrix

### **Phase 3: Advanced Fields (Month 2)**
⬜ Blackout dates & restrictions
⬜ Commission structure
⬜ Cancellation tiers
⬜ Special packages

### **Phase 4: AI Intelligence (Month 3)**
⬜ Multi-turn extraction
⬜ Contract comparison
⬜ Negotiation suggestions
⬜ PMS integration

---

## 🔧 TECHNICAL IMPLEMENTATION

### **Prisma Schema Extensions**
```prisma
model Contract {
  // ... existing fields ...
  
  // New fields
  contractType      String @map("contract_type") // RATES_ONLY, FULL, GROUP, etc.
  propertyType      String @map("property_type") // hotel, resort, villa
  starRating       Int?
  totalRooms       Int?
  chainAffiliation String? @map("chain_affiliation")
  
  // Relationships
  blackoutDates    BlackoutDate[]
  specialPackages  SpecialPackage[]
  commission       Commission?
}

model BlackoutDate {
  id          String   @id @default(cuid())
  contractId  String
  fromDate    DateTime @map("from_date")
  toDate      DateTime @map("to_date")
  reason      String
  rateMultiplier Float?  @map("rate_multiplier")
  contract    Contract @relation(fields: [contractId], references: [id])
}

model SpecialPackage {
  id          String   @id @default(cuid())
  contractId  String
  name        String
  price       Float
  inclusions  String[]
  validFrom   DateTime @map("valid_from")
  validTo     DateTime @map("valid_to")
  contract    Contract @relation(fields: [contractId], references: [id])
}
```

---

## 💡 YOUR INPUT NEEDED

**Which features do you want first?**

1. **Dynamic Contract Layout** - Form adapts to document type
2. **Blackout Dates** - Track restricted periods
3. **Corporate Contracts** - Support B2B bookings
4. **Event Contracts** - Incentive & conference rates
5. **Visual Rate Matrix** - Timeline/heatmap view
6. **Contract Comparison** - Compare two PDFs side-by-side
7. **Negotiation Assistant** - AI tips for better deals

**Tell me which ones excite you!** 🚀
