export const selectWhere = (result: unknown) => {
  const chain = {
    innerJoin: jest.fn(),
    leftJoin: jest.fn(),
    where: jest.fn().mockResolvedValue(result),
    orderBy: jest.fn().mockResolvedValue(result),
    groupBy: jest.fn().mockResolvedValue(result),
  };

  chain.innerJoin.mockReturnValue(chain);
  chain.leftJoin.mockReturnValue(chain);

  return {
    from: jest.fn().mockReturnValue(chain),
  };
};

export const insertReturning = (id: Record<string, number | string>) => ({
  values: jest.fn().mockReturnValue({
    $returningId: jest.fn().mockResolvedValue([id]),
  }),
});

export const mutation = () => ({
  set: jest.fn().mockReturnValue({
    where: jest.fn().mockResolvedValue(undefined),
  }),
  where: jest.fn().mockResolvedValue(undefined),
});
