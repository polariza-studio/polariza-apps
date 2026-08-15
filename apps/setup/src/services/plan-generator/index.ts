import { MockPlanGenerator } from './mock-plan-generator';
import type { PlanGenerator } from './plan-generator';

export const planGenerator: PlanGenerator = new MockPlanGenerator();
