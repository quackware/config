import {
  DeleteParameterCommand,
  GetParameterCommand,
  GetParametersByPathCommand,
  GetParametersCommand,
  Parameter,
  PutParameterCommand,
  SSMClient,
  Tag,
} from "https://esm.quack.id/@aws-sdk/client-ssm@3.226.0";
import {
  camelCaseProperties,
  LiteralUnion,
  QuackError,
  stripPrefixProperties,
  Type as T,
  TypeCompiler,
} from "./deps.ts";
import { paramName, SSMParams } from "./ssm-params.ts";

export const AWSCredentialsSchema = T.Object({
  AWS_REGION: T.ReadonlyOptional(T.String()),
  AWS_ACCESS_KEY_ID: T.Readonly(T.String()),
  AWS_SECRET_ACCESS_KEY: T.Readonly(T.String()),
  AWS_SESSION_TOKEN: T.ReadonlyOptional(T.String()),
});

export const AWSCredentialsCheck = TypeCompiler.Compile(AWSCredentialsSchema);

export interface ValidParameter extends Parameter {
  Name: string;
  Value: string;
}

export interface Credentials {
  /**
   * AWS access key ID
   */
  readonly accessKeyId: string;
  /**
   * AWS secret access key
   */
  readonly secretAccessKey: string;
  /**
   * A security or session token to use with these credentials. Usually
   * present for temporary credentials.
   */
  readonly sessionToken?: string;
  /**
   * A {Date} when these credentials will no longer be accepted.
   */
  readonly expiration?: Date;
}

export interface CreateParameter extends ValidParameter {
  /** @default "SecureString" */
  Type?: "String" | "StringList" | "SecureString";
  Tags?: Tag[];
}

/** Wrapper for AWS SSM functionality */
export class SSM {
  static initializeFromEnv() {
    const credentials = Deno.env.toObject();
    if (AWSCredentialsCheck.Check(credentials)) {
      const adjustedCredentials = camelCaseProperties(stripPrefixProperties(credentials, "AWS_"));
      const region = adjustedCredentials.region ?? "us-east-1";
      return SSM.initialize(adjustedCredentials, { region });
    } else {
      const errors = [...AWSCredentialsCheck.Errors(credentials)];
      throw QuackError.fromValueErrors(errors);
    }
  }

  static initialize(credentials: Credentials, config: { region?: string } = {}) {
    const region = config.region ?? "us-east-1";
    const client = new SSMClient({ credentials, region });
    return new SSM({ client });
  }

  readonly client;
  readonly paramName;

  constructor(ctx: { client: SSMClient }) {
    this.client = ctx.client;
    this.paramName = paramName;
  }

  /**
   * @throws {Error}
   */
  async get(Name: LiteralUnion<SSMParams, string>) {
    const command = new GetParameterCommand({
      Name,
      WithDecryption: true,
    });
    return await this.client.send(command).then(({ Parameter }) => {
      if (Parameter != null && Parameter.Name != null && Parameter.Value != null) {
        return {
          Name: Parameter.Name,
          Value: Parameter.Value,
        };
      }
      throw new Error(`Unable to retrieve parameter ${Name}`);
    });
  }

  /**
   * @throws {Error}
   */
  async getMany(Names: string[]) {
    const command = new GetParametersCommand({
      Names,
      WithDecryption: true,
    });
    return await this.client.send(command).then(({ Parameters, InvalidParameters }) => {
      return {
        Parameters: (Parameters ?? []).map(({ Name, Value }) => {
          if (Name === undefined || Value === undefined) {
            throw new Error(`Unable to retrieve parameter ${Name}`);
          }
          return {
            Name,
            Value,
          };
        }),
        InvalidParameters: InvalidParameters ?? [],
      };
    });
  }

  /**
   * @throws {Error}
   */
  async getByPath(Path: string, Recursive: boolean = true) {
    const command = new GetParametersByPathCommand({
      Path,
      WithDecryption: true,
      Recursive,
    });

    return await this.client.send(command).then(({ Parameters }) => {
      return Parameters?.filter((param): param is ValidParameter => param.Value != null && param.Name != null) ?? [];
    });
  }

  /** Create a new SSM parameter */
  async create(param: CreateParameter) {
    const Type = param.Type ?? "SecureString";
    const command = new PutParameterCommand({
      ...param,
      Type,
    });
    return await this.client.send(command);
  }

  /** Create a new data url SSM parameter */
  // async createDataUrlParam(Name: string, data: Record<string, string>) {
  //   const dataString = createDefaultExportDataUrl(data);
  //   return await this.create({ Name, Value: dataString, Tags: [ENCODING_TAG("dataurl")] });
  // }

  /** Delete a parameter with the given name */
  async delete(Name: string) {
    const command = new DeleteParameterCommand({
      Name,
    });

    return await this.client.send(command);
  }
}
