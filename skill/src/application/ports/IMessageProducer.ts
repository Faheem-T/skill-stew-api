import type { AnyAppEvent } from "@skillstew/common";

export interface IMessageProducer {
  publish: (event: AnyAppEvent) => void;
}
