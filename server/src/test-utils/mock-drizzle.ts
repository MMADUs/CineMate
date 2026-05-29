export const selectWhere = (result: unknown) => ({
  from: jest.fn().mockReturnValue({
    innerJoin: jest.fn().mockReturnValue({
      where: jest.fn().mockResolvedValue(result),
    }),
    where: jest.fn().mockResolvedValue(result),
    orderBy: jest.fn().mockResolvedValue(result),
    groupBy: jest.fn().mockResolvedValue(result),
  }),
});

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
