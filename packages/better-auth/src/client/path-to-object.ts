import { BetterFetchResponse } from "@better-fetch/fetch";
import { Context, Endpoint } from "better-call";
import {
	HasRequiredKeys,
	Prettify,
	UnionToIntersection,
} from "../types/helper";

type CamelCase<S extends string> =
	S extends `${infer P1}-${infer P2}${infer P3}`
		? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
		: Lowercase<S>;

export type PathToObject<
	T extends string,
	Fn extends (...args: any[]) => any,
> = T extends `/${infer Segment}/${infer Rest}`
	? { [K in CamelCase<Segment>]: PathToObject<`/${Rest}`, Fn> }
	: T extends `/${infer Segment}`
		? { [K in CamelCase<Segment>]: Fn }
		: never;

type MergeRoutes<T> = UnionToIntersection<T>;
type InferRoute<API> = API extends {
	[key: string]: infer T;
}
	? T extends Endpoint
		? T["options"]["metadata"] extends {
				onClient: "hide";
			}
			? {}
			: PathToObject<
					T["path"],
					T extends (ctx: infer C) => infer R
						? C extends Context<any, any>
							? (
									...data: HasRequiredKeys<C> extends true
										? [Prettify<C>]
										: [Prettify<C>?]
								) => Promise<BetterFetchResponse<Awaited<R>>>
							: never
						: never
				>
		: never
	: never;
export type InferRoutes<API> = MergeRoutes<InferRoute<API>>;