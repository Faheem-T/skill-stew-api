export type GetAllConnectedUserIdsOutputDTO = {
  userId: string;
  status: "CONNECTED" | "PENDING_SENT" | "PENDING_RECEIVED";
}[];
