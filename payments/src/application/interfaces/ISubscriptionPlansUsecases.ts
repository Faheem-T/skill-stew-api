import {
  CreateSubscriptionPlanDto,
  EditSubscriptionPlanDto,
} from "../dtos/SubscriptionPlansDtos";

export interface PresentationSubscriptionPlan {
  id: string;
  name: string;
  description: string;
  features: string[];
  active: boolean;
  price: { monthly: number; yearly: number; currency: string };
  free_workshop_hours: number;
}

export interface ISubscriptionPlansUsecases {
  createPlan(
    dto: CreateSubscriptionPlanDto,
  ): Promise<PresentationSubscriptionPlan | null>;
  getPlans(): Promise<PresentationSubscriptionPlan[]>;
  editPlan(
    id: string,
    dto: EditSubscriptionPlanDto,
  ): Promise<PresentationSubscriptionPlan>;
  deletePlan(id: string): Promise<PresentationSubscriptionPlan>;
}
