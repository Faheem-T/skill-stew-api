import { AnyAppEvent } from "@skillstew/common";

export interface IProducer {
  publish: (event: AnyAppEvent) => void;
}
