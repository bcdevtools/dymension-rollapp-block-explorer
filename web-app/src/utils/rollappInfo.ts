import { chain_info } from '@prisma/client';

export type RollappInfo = {
  chainId: string;
  name: string;
  path: string;
  rpcUrls: string[];
};

export function normalizeRollappsInfo(chainInfos: chain_info[]): RollappInfo[] {
  return chainInfos.map(chainInfo => ({
    chainId: chainInfo.chain_id,
    name: chainInfo.name,
    path: `/${chainInfo.name
      .toLowerCase()
      .replace(/[^a-z0-9-\s]/g, '')
      .trim()
      .replace(/\s/g, '-')}`,
    rpcUrls: chainInfo.be_json_rpc_urls,
  }));
}

export function getRollappInfoByPath(
  chainInfo: chain_info[],
  path: string
): RollappInfo | undefined {
  return normalizeRollappsInfo(chainInfo).find(
    rollappInfo => rollappInfo.path === path
  );
}
