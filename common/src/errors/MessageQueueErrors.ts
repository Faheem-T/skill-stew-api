import { EventName } from "../events/EventMap";
import { InfrastructureError } from "./AppError";
import { MessageQueueErrorCodes } from "./codes/MessageQueueErrorCodes";

export class InvalidEventPayloadError extends InfrastructureError {
  constructor(eventName: EventName, errorString: string) {
    super(
      MessageQueueErrorCodes.INVALID_EVENT_PAYLOAD + `for ${eventName}`,
      "INVALID_EVENT_PAYLOAD",
      { zodErrorString: errorString },
    );
  }
  toJSON(): object {
    return {
      message: this.message,
      code: this.code,
      error: this.context!.zodErrorStrings,
    };
  }
}

export class UnknownEventError extends InfrastructureError {
  constructor(eventName: string) {
    super(MessageQueueErrorCodes.UNKNOWN_EVENT + eventName, "UNKNOWN_EVENT");
  }
  toJSON(): object {
    return { message: this.message, code: this.code };
  }
}

export class ConsumerUsedBeforeInitializationError extends InfrastructureError {
  constructor() {
    super(
      MessageQueueErrorCodes.CONSUMER_USED_BEFORE_INITIALIZATION,
      "CONSUMER_USED_BEFORE_INITIALIZATION",
    );
  }
  toJSON(): object {
    return { message: this.message, code: this.code };
  }
}

export class ProducerUsedBeforeInitializationError extends InfrastructureError {
  constructor() {
    super(
      MessageQueueErrorCodes.PRODUCER_USED_BEFORE_INITIALIZATION,
      "PRODUCER_USED_BEFORE_INITIALIZATION",
    );
  }
  toJSON(): object {
    return { message: this.message, code: this.code };
  }
}
