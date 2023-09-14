import { FastifyInstance, FastifyPluginAsync, FastifyReply } from "fastify"

import { Endpoint } from "./types/server";
import { BaseReuqestContext, Request } from "./types";
import { replaceUrl } from "./utils";

export interface ProxyConfig {
	handler: (req: Request, ctx: BaseReuqestContext, reply: FastifyReply ) => Promise<void>
}

let fastify: FastifyInstance

let proxyNameList: string[]

export async function registerProxyHandler(path: string, config: ProxyConfig) {
  const routeUrl = replaceUrl(Endpoint.Proxy, { path })
  fastify.route({
    method: ['GET', 'POST'],
    url: routeUrl,
    config: { kind: 'proxy', proxyPath: path },
    async handler(req, reply) {
      const request = {
        body: req.body,
        headers: req.headers,
        method: req.method,
        query: req.query,
      };
      await config.handler(request, req.ctx, reply)
    }
  })
  proxyNameList.push(path)
}

export const FireboomProxiesPlugin: FastifyPluginAsync = async (_fastify) => {
  fastify = _fastify
  proxyNameList = []
}

export function getproxyNameList() {
  return proxyNameList
}