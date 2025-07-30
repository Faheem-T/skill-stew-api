export class SubscriptionPlan {
  id?: string;
  name: string;
  description: string;
  active: boolean;
  price: {
    monthly: number;
    yearly: number;
    currency: string;
  };
  freeWorkshopHours: number;
  features: string[];
  constructor({
    name,
    price,
    freeWorkshopHours,
    id,
    features,
    description,
    active = true,
  }: {
    name: string;
    description: string;
    price: { monthly: number; yearly: number; currency?: string };
    freeWorkshopHours: number;
    id?: string;
    features: string[];
    active?: boolean;
  }) {
    this.name = name;
    this.price = { currency: "INR", ...price };
    this.freeWorkshopHours = freeWorkshopHours;
    this.id = id;
    this.features = features;
    this.description = description;
    this.active = active;
  }
}
