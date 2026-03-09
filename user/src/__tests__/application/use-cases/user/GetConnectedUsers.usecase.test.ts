import { describe, jest, it, expect } from "@jest/globals";
import { GetConnectedUsers } from "../../../../application/use-cases/user/GetConnectedUsers.usecase";
import { IUserConnectionRepository } from "../../../../domain/repositories/IUserConnectionRepository";
import { IStorageService } from "../../../../application/ports/IStorageService";

describe("GetConnectedUsers", () => {
  it("maps avatar keys to public urls and preserves pagination metadata", async () => {
    const getAcceptedConnectionsForUserPaginated = jest
      .fn<IUserConnectionRepository["getAcceptedConnectionsForUserPaginated"]>()
      .mockResolvedValue({
        rows: [
          {
            connectionId: "conn-1",
            connectedAt: new Date("2026-03-07T10:00:00.000Z"),
            connectedUserId: "user-1",
            username: "alice",
            avatarKey: "avatars/alice.png",
          },
          {
            connectionId: "conn-2",
            connectedAt: new Date("2026-03-07T09:00:00.000Z"),
            connectedUserId: "user-2",
            username: null,
            avatarKey: null,
          },
        ],
        hasNextPage: true,
        nextCursor: "next-cursor",
      });

    const connectionRepo: Pick<
      IUserConnectionRepository,
      "getAcceptedConnectionsForUserPaginated"
    > = {
      getAcceptedConnectionsForUserPaginated,
    };

    const getPublicUrl = jest
      .fn<IStorageService["getPublicUrl"]>()
      .mockImplementation((key: string) => `https://cdn.test/${key}`);

    const storageService: Pick<IStorageService, "getPublicUrl"> = {
      getPublicUrl,
    };

    const usecase = new GetConnectedUsers(
      connectionRepo as IUserConnectionRepository,
      storageService as IStorageService,
    );

    const result = await usecase.exec({
      userId: "97a0e6cd-74b4-457e-a34c-ce49b00707e1",
      limit: 2,
      cursor: "cursor-1",
    });

    expect(
      connectionRepo.getAcceptedConnectionsForUserPaginated,
    ).toHaveBeenCalledWith({
      userId: "97a0e6cd-74b4-457e-a34c-ce49b00707e1",
      limit: 2,
      cursor: "cursor-1",
    });
    expect(storageService.getPublicUrl).toHaveBeenCalledWith(
      "avatars/alice.png",
    );
    expect(result).toEqual({
      users: [
        {
          id: "user-1",
          username: "alice",
          avatarUrl: "https://cdn.test/avatars/alice.png",
          connectedAt: new Date("2026-03-07T10:00:00.000Z"),
        },
        {
          id: "user-2",
          username: null,
          avatarUrl: null,
          connectedAt: new Date("2026-03-07T09:00:00.000Z"),
        },
      ],
      hasNextPage: true,
      nextCursor: "next-cursor",
    });
  });
});
