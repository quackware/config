import { SSM } from "../ssm.ts";
import { assertEquals, assertExists } from "./deps.ts";

Deno.test("SSM", async (t) => {
  await t.step("initializeFromEnv reads environment variables correctly", async () => {
    const accessKeyId = crypto.randomUUID();
    const secretAccessKey = crypto.randomUUID();
    Deno.env.set("AWS_ACCESS_KEY_ID", accessKeyId);
    Deno.env.set("AWS_SECRET_ACCESS_KEY", secretAccessKey);

    const ssm = SSM.initializeFromEnv();
    assertExists(ssm);
    const { config } = ssm.client;

    const region = await config.region();

    assertEquals(region, "us-east-1");

    const credentials = await config.credentials();
    assertEquals(credentials.accessKeyId, accessKeyId);
    assertEquals(credentials.secretAccessKey, secretAccessKey);
  });

  await t.step("initialize does not read from environment variables", async () => {
    const accessKeyId = crypto.randomUUID();
    const secretAccessKey = crypto.randomUUID();

    const ssm = SSM.initialize({ accessKeyId, secretAccessKey }, { region: "us-west-2" });
    assertExists(ssm);
    const { config } = ssm.client;

    const region = await config.region();

    assertEquals(region, "us-west-2");

    const credentials = await config.credentials();
    assertEquals(credentials.accessKeyId, accessKeyId);
    assertEquals(credentials.secretAccessKey, secretAccessKey);
  });
});
