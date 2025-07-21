export class SubscriptionPlan {
  id?: string;
  name: string;
  price: {
    monthly: number;
    yearly: number;
    currency: string;
  };
  freeWorkshopHours: number;
  constructor({
    name,
    price,
    freeWorkshopHours,
    id,
  }: {
    name: string;
    price: { monthly: number; yearly: number; currency?: string };
    freeWorkshopHours: number;
    id?: string;
  }) {
    this.name = name;
    this.price = { currency: "INR", ...price };
    this.freeWorkshopHours = freeWorkshopHours;
    this.id = id;
  }
}
