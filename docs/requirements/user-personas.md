# User Personas & Permission Matrices

## 1. Platform Personas

- **Farmer:** Individual producer. Can register farms, record harvest batches, list produce, negotiate offers, and view pickup schedules.
- **Cooperative Manager:** Manager of aggregated farms. Can register co-op members, manage collection centers, list aggregated produce, negotiate bulk contracts, and track member earnings.
- **Buyer:** Commercial purchaser. Can submit demand RFQs, browse marketplace, negotiate offers, place orders, and track fulfillment/delivery.
- **Logistics Manager:** Operations manager. Can view pending fulfillments, create pickup tasks, assign drivers/vehicles, manage hub transfers, and resolve transit exceptions.
- **Delivery Agent / Driver:** Logistics agent. Can view assigned routes/pickups, update milestone progress, and capture proof-of-delivery (PoD).

## 2. Administrative Personas (`apps/admin`)

- **Super Admin:** Highest authority. Manages administrators, system settings, security policies, and high-level platform overrides.
- **KYC Admin:** Compliance reviewer. InspectsSubmitted KYC applications and document evidence; approves or rejects applications with reason codes.
- **Operations Admin:** Platform monitor. Tracks active orders, marketplace disputes, and catalog categories.
- **Logistics Admin:** Overarching logistics overseer. Coordinates high-level hub capacities and regional shipping routes.
- **Finance Admin:** Financial auditor. Tracks platform transaction summaries, buyer billing holds, and seller payout reports.
- **Support Admin:** Customer assistance representative. Handles read-only user account inquiries and ticket escalations.
