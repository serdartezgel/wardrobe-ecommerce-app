"use server";

import { revalidatePath } from "next/cache";
import z from "zod";

import { Address } from "../generated/prisma";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { NotFoundError, UnauthorizedError } from "../http-errors";
import {
  AddressInput,
  addressSchema,
  UpdateAddressInput,
  updateAddressSchema,
} from "../validations/address.validation";

export async function getUserAddresses(): Promise<ActionResponse<Address[]>> {
  const validationResult = await action({
    params: {},
    schema: z.object({}),
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const prisma = validationResult.prisma;
  const userId = validationResult.session?.user.id;

  if (!userId) {
    throw new UnauthorizedError();
  }

  try {
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return {
      success: true,
      data: addresses,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function createAddress(
  input: AddressInput,
): Promise<ActionResponse<Address>> {
  const validationResult = await action({
    params: input,
    schema: addressSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const prisma = validationResult.prisma;
  const userId = validationResult.session?.user.id;

  if (!userId) {
    throw new UnauthorizedError();
  }

  try {
    if (input.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        fullName: input.fullName,
        phone: input.phone,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2 || null,
        city: input.city,
        state: input.state,
        zipCode: input.zipCode,
        country: input.country,
        isDefault: input.isDefault,
      },
    });

    revalidatePath("/account/addresses");

    return {
      success: true,
      data: address,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function updateAddress(
  input: UpdateAddressInput,
): Promise<ActionResponse<Address>> {
  const validationResult = await action({
    params: input,
    schema: updateAddressSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { id, ...data } = validationResult.params!;
  const prisma = validationResult.prisma;
  const userId = validationResult.session?.user.id;

  if (!userId || !id) {
    throw new UnauthorizedError();
  }

  try {
    const existingAddress = await prisma.address.findUnique({
      where: { id, userId },
    });

    if (!existingAddress) {
      throw new NotFoundError("Address");
    }

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const updateData = Object.fromEntries(
      Object.entries(data)
        .map(([key, value]) => [key, value === "" ? null : value])
        .filter(([, value]) => value !== undefined),
    );

    const address = await prisma.address.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/account/addresses");

    return {
      success: true,
      data: address,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deleteAddress(
  addressId: string,
): Promise<ActionResponse<{ success: boolean }>> {
  const validationResult = await action({
    params: { addressId },
    schema: z.object({ addressId: z.string().min(1) }),
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const prisma = validationResult.prisma;
  const userId = validationResult.session?.user.id;

  if (!userId) {
    throw new UnauthorizedError();
  }

  try {
    const existingAddress = await prisma.address.findUnique({
      where: { id: addressId, userId },
    });

    if (!existingAddress) {
      throw new NotFoundError("Address");
    }

    await prisma.address.delete({
      where: { id: addressId },
    });

    revalidatePath("/account/addresses");

    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function setDefaultAddress(
  addressId: string,
): Promise<ActionResponse<Address>> {
  const validationResult = await action({
    params: { addressId },
    schema: z.object({ addressId: z.string().min(1) }),
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const prisma = validationResult.prisma;
  const userId = validationResult.session?.user.id;

  if (!userId) {
    throw new UnauthorizedError();
  }

  try {
    const existingAddress = await prisma.address.findUnique({
      where: { id: addressId, userId },
    });

    if (!existingAddress) {
      throw new NotFoundError("Address");
    }

    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    const address = await prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });

    revalidatePath("/account/addresses");

    return {
      success: true,
      data: address,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
