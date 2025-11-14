"use server";

import { headers } from "next/headers";
import z, { ZodError, ZodType } from "zod";

import { auth, Session } from "../auth";
import { UnauthorizedError, ValidationError } from "../http-errors";

type ActionOptions<T> = {
  params?: T;
  schema?: ZodType<T>;
  authorize?: boolean;
};

async function action<T>({
  params,
  schema,
  authorize = false,
}: ActionOptions<T>) {
  if (schema && params) {
    try {
      schema.parse(params);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError(
          z.flattenError(error).fieldErrors as Record<string, string[]>,
        );
      } else {
        throw new Error("Schema validation failed.");
      }
    }
  }

  let session: Session | null = null;

  if (authorize) {
    session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return new UnauthorizedError();
    }
  }

  return { params, session };
}

export default action;
