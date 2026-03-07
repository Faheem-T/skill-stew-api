import { describe, jest, it, expect } from "@jest/globals";
import { GetConnectedUsersCount } from "../../../../application/use-cases/user/GetConnectedUsersCount.usecase";
import { IUserConnectionRepository } from "../../../../domain/repositories/IUserConnectionRepository";

describe("GetConnectedUsersCount", () => {
  it("returns the accepted connections count for the given user", async () => {
    const countAcceptedConnectionsForUser = jest
      .fn<IUserConnectionRepository["countAcceptedConnectionsForUser"]>()
      .mockResolvedValue(12);

    const connectionRepo: Pick<
      IUserConnectionRepository,
      "countAcceptedConnectionsForUser"
    > = {
      countAcceptedConnectionsForUser,
    };

    const usecase = new GetConnectedUsersCount(
      connectionRepo as IUserConnectionRepository,
    );

    const result = await usecase.exec({
      userId: "97a0e6cd-74b4-457e-a34c-ce49b00707e1",
    });

    expect(countAcceptedConnectionsForUser).toHaveBeenCalledWith(
      "97a0e6cd-74b4-457e-a34c-ce49b00707e1",
    );
    expect(result).toEqual({ count: 12 });
  });
});
