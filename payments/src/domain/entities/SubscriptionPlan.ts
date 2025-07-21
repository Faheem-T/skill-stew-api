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
  }: {
    name: string;
    price: { monthly: number; yearly: number; currency?: string };
    freeWorkshopHours: number;
  }) {
    this.name = name;
    this.price = { currency: "INR", ...price };
    this.freeWorkshopHours = freeWorkshopHours;
  }
}
