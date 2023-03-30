import { assertEquals } from "https://git.quack.id/test-helpers/mod.ts";
import { paramName } from "../ssm-params.ts";

Deno.test("ssm-params", async (t) => {
  await t.step("paramName", () => {
    assertEquals(
      paramName({
        category: "api",
        domain: "quackware",
        param: "config.json",
      }),
      "/api/quackware/config.json",
    );
  });
});
