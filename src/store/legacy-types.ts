// /*
//  * Type definitions for RematchDispatch
//  */

import * as Redux from "redux";

export type ExtractRematchDispatcherAsyncFromEffect<
  E
  > = E extends () => Promise<infer R>
  ? RematchDispatcherAsync<void, void, R>
  : E extends (payload: infer P) => Promise<infer R>
  ? RematchDispatcherAsync<P, void, R>
  : RematchDispatcherAsync<any, any, any>;

export type ExtractRematchDispatchersFromEffectsObject<
  effects extends ModelEffects<any>
  > = {
    [effectKey in keyof effects]: ExtractRematchDispatcherAsyncFromEffect<
      effects[effectKey]
    >;
  };

export type ExtractRematchDispatchersFromEffects<
  effects extends ModelConfig["effects"]
  > = effects extends (...args: any[]) => infer R
  ? R extends ModelEffects<any>
  ? ExtractRematchDispatchersFromEffectsObject<R>
  : {}
  : effects extends ModelEffects<any>
  ? ExtractRematchDispatchersFromEffectsObject<effects>
  : {};

export type ExtractRematchDispatcherFromReducer<R> = R extends () => any
  ? RematchDispatcher<void, void>
  : R extends (state: infer S) => infer S
  ? RematchDispatcher<void, void>
  : R extends (state: infer S, payload: infer P) => infer S
  ? RematchDispatcher<P, void>
  : R extends (state: infer S, payload: infer P, meta: infer M) => infer S
  ? RematchDispatcher<P, M>
  : RematchDispatcher<any, any>;

export type ExtractRematchDispatchersFromReducersObject<
  reducers extends ModelReducers<any>
  > = {
    [reducerKey in keyof reducers]: ExtractRematchDispatcherFromReducer<
      reducers[reducerKey]
    >;
  };

export type ExtractRematchDispatchersFromReducers<
  reducers extends ModelConfig["reducers"]
  > = ExtractRematchDispatchersFromReducersObject<reducers & {}>;

export type ExtractRematchDispatchersFromModel<
  M extends ModelConfig
  > = ExtractRematchDispatchersFromReducers<M["reducers"]> &
  ExtractRematchDispatchersFromEffects<M["effects"]>;

export type ExtractRematchDispatchersFromModels<M> = {
  [modelKey in keyof M]: M[modelKey] extends ModelConfig
  ? ExtractRematchDispatchersFromModel<M[modelKey]>
  : never;
};

export type RematchDispatcher<P = void, M = void> = ([P] extends [void]
  ? (...args: any[]) => Action<any, any>
  : [M] extends [void]
  ? (payload: P) => Action<P, void>
  : (payload: P, meta: M) => Action<P, M>) &
  ((action: Action<P, M>) => Redux.Dispatch<Action<P, M>>) &
  ((action: Action<P, void>) => Redux.Dispatch<Action<P, void>>);

export type RematchDispatcherAsync<P = void, M = void, R = void> = ([
  P
] extends [void]
  ? (...args: any[]) => Promise<R>
  : [M] extends [void]
  ? (payload: P) => Promise<R>
  : (payload: P, meta: M) => Promise<R>) &
  ((action: Action<P, M>) => Promise<R>) &
  ((action: Action<P, void>) => Promise<R>);

export type RematchDispatch<M = void> = ExtractRematchDispatchersFromModels<M>;

export type Action<P = any, M = any> = {
  type: string;
  payload?: P;
  meta?: M;
};

export type ModelReducers<S = any> = {
  [key: string]: (state: S, payload: any, meta?: any) => S;
};

type ModelEffects<S> = {
  [key: string]: (
    this: { [key: string]: (payload?: any, meta?: any) => Action<any, any> },
    payload: any,
    rootState: S
  ) => void;
};

export type Models<K extends string = string> = {
  [key in K]: ModelConfig;
};

export interface ModelConfig<S = any, SS = S, K extends string = string> {
  name?: string;
  state: S;
  baseReducer?: (state: SS, action: Action) => SS;
  reducers?: ModelReducers<S>;
  effects?:
  | ModelEffects<any>
  | (<M extends Models<K> | void = void>(
    dispatch: RematchDispatch<M>
  ) => ModelEffects<any>);
}