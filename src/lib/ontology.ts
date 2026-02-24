/**
 * 知识本体/词典配置
 * 定义同类项及其父级分类，用于知识库的自动归纳与聚合
 */

export interface OntologyCategory {
  id: string;
  label: string;
  icon?: string;
  color: string;
  members: string[]; // 属于该分类的关键词/标签
}

export const KNOWLEDGE_ONTOLOGY: OntologyCategory[] = [
  {
    id: "exchanges",
    label: "交易平台/场所",
    color: "oklch(0.6 0.16 250)", // 蓝色
    members: ["Binance", "币安", "OKX", "欧易", "Bybit", "Upbit", "Polymarket", "Virtu Financial", "Jane Street", "Citadel", "Virtu", "Coinbase", "OpenLoot", "Uniswap", "Jupiter"]
  },
  {
    id: "institutions",
    label: "顶级机构/投行",
    color: "oklch(0.5 0.12 280)", // 紫色
    members: ["Goldman Sachs", "高盛", "Renaissance Technologies", "文艺复兴", "Two Sigma", "Bridgewater", "桥水", "AQR", "Man Group", "Point72", "D.E. Shaw", "Citadel Securities", "BlackRock", "贝莱德"]
  },
  {
    id: "assets",
    label: "核心资产/代币",
    color: "oklch(0.7 0.15 40)", // 橙色
    members: ["BTC", "比特币", "ETH", "以太坊", "SOL", "Solana", "TRUMP", "JTO", "DUSK", "HYPE", "AAVE", "JUP", "SKY", "AERO", "STRK", "ZEC", "CFG", "XVS", "AVNT", "DOLO", "BLUAI", "SLP", "SOMI"]
  },
  {
    id: "narratives",
    label: "核心叙事/赛道",
    color: "oklch(0.65 0.2 150)", // 绿色
    members: ["DeFi", "NFT", "AI", "人工智能", "RWA", "BTCFi", "InfoFi", "Meme", "稳定币", "支付", "隐私", "Layer2", "L2", "MEV", "Liquid Staking", "社交", "SocialFi"]
  },
  {
    id: "strategies",
    label: "交易策略/模型",
    color: "oklch(0.6 0.15 10)", // 红色
    members: ["量化交易", "算法交易", "做市商", "因子模型", "配对交易", "宏观策略", "机器学习", "统计套利", "滚仓", "SOP", "底部反弹", "趋势盘", "持仓量", "资金费率", "清算"]
  }
];

/**
 * 根据标签查找所属分类
 */
export function getCategoryByTag(tag: string): OntologyCategory | undefined {
  const normalizedTag = tag.toLowerCase();
  return KNOWLEDGE_ONTOLOGY.find(cat => 
    cat.members.some(m => m.toLowerCase() === normalizedTag || normalizedTag.includes(m.toLowerCase()))
  );
}

/**
 * 基于文本内容进行语义匹配，识别潜在的本体分类
 */
export function suggestCategories(content: string): OntologyCategory[] {
  const results: OntologyCategory[] = [];
  const normalizedContent = content.toLowerCase();
  
  for (const category of KNOWLEDGE_ONTOLOGY) {
    // 检查分类成员是否出现在内容中
    const matchedMembers = category.members.filter(m => 
      normalizedContent.includes(m.toLowerCase())
    );
    
    // 如果匹配到的成员超过一定阈值（或有重要成员），则推荐该分类
    if (matchedMembers.length > 0) {
      results.push(category);
    }
  }
  
  return results;
}

/**
 * 获取所有定义的成员列表
 */
export const ONTOLOGY_MEMBERS = KNOWLEDGE_ONTOLOGY.flatMap(c => c.members);
