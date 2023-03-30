export const SSM_QUACKWARE_TEST = "/ci/quackware/quackware/env.test.json" as const;
export const SSM_QUACKBOT_CREDENTIALS = "/ci/quackware/quackbot/credentials.json" as const;
export const SSM_QUACKSTACK_TEST = "/ci/quackware/quackstack/env.test.json";

export type SSMParams = typeof SSM_QUACKWARE_TEST | typeof SSM_QUACKBOT_CREDENTIALS | typeof SSM_QUACKSTACK_TEST;

export type KnownParamCategories = "ci" | "db" | "api" | "ops";

/**
 * Construct a `SSM` parameter name that adhears to `QuackWare` standards and is fully type safe.
 *
 * @example
 *
 * const name = paramName({
 *  category: "api",
 *  domain: "quackware",
 *  param: "config.json",
 * });
 *
 * console.log(name); // /api/quackware/config.json
 */
export function paramName<
  Category extends KnownParamCategories,
  Domain extends string,
  ParameterName extends `${string}.${"json" | "ts" | "yml" | "jsonc"}`,
>(
  param: { category: Category; domain: Domain; param: ParameterName },
) {
  return `/${param.category}/${param.domain}/${param.param}` as const;
}
