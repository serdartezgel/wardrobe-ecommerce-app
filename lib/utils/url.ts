import qs from "query-string";

interface UrlQueryParams {
  params: string;
  key: string;
  value: string | null;
  pathname: string;
}

interface RemoveUrlQueryParams {
  params: string;
  keysToRemove: string[];
  pathname: string;
}

export const formUrlQuery = ({
  params,
  key,
  value,
  pathname,
}: UrlQueryParams) => {
  const queryString = qs.parse(params);

  queryString[key] = value;

  return qs.stringifyUrl({
    url: pathname,
    query: queryString,
  });
};

export const removeKeysFromUrlQuery = ({
  params,
  keysToRemove,
  pathname,
}: RemoveUrlQueryParams) => {
  const queryString = qs.parse(params);

  keysToRemove.forEach((key) => {
    delete queryString[key];
  });

  return qs.stringifyUrl(
    {
      url: pathname,
      query: queryString,
    },
    { skipNull: true },
  );
};
