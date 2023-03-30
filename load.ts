#!/usr/bin/env -S deno run -A --unstable --no-check

import { SSM } from "./ssm.ts";

/**
 * Initialize a `SSM` instance from environment variables and attempt to load the config
 * values for the provided `parameterNames`.
 */
export async function getConfig(parameterNames: string[]) {
  const ssm = SSM.initializeFromEnv();
  const configs = await ssm.getMany(parameterNames);
  return configs;
}

/**
 * TODO: Make this not necessarily dependent on the GITHUB_ENV output file.
 */
// export async function loadConfig(parameterNames: string[], mask: boolean = true) {
//   const params = await getConfig(parameterNames);
//   return params.Parameters.map((param) => {
//     let env: Record<string, string>;
//     try {
//       env = JSON.parse(atob(param.Value));
//     } catch {
//       env = JSON.parse(param.Value);
//     }
//     const envs = Object.entries(env).map(([key, val]) => {
//       if (mask) {
//         console.log(`::add-mask::${key}`);
//       }
//       return `${key}=${val}`;
//     });

//     console.log(`Writing ${envs.length} variables`);
//     return envs.join("\n");
//   }).join("\n");
// }

// export async function writeConfig(config: string, outFile: string = Deno.env.get("GITHUB_ENV")!) {
//   return await Deno.writeTextFile(outFile, config);
// }

// if (import.meta.main) {
//   const config = await loadConfig(Deno.args);
//   await writeConfig(config);
// }
